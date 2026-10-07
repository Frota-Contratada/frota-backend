import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  AgendamentoNotificacao,
  NotificacaoConteudo,
  StatusAgendamentoNotificacao,
} from '../domain/notificacao';
import { NotificacaoEventsService } from '../gateways/notificacao-events.service';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';

/**
 * Entrega notificações na hora, sem passar pela fila de agendamento.
 *
 * O agendamento criado aqui é efêmero: ele não entra no índice da solicitação,
 * então o cancelamento de notificações pendentes nunca apaga o que já foi
 * entregue ao usuário.
 */
@Injectable()
export class EnviarNotificacaoService {
  private readonly logger = new Logger(EnviarNotificacaoService.name);
  private readonly ttlEmMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
    private readonly notificacaoEvents: NotificacaoEventsService,
  ) {
    const dias = Number(
      this.configService.get<string>('NOTIFICACOES_TTL_DIAS') ?? 30,
    );
    this.ttlEmMs = (Number.isFinite(dias) && dias > 0 ? dias : 30) * 86_400_000;
  }

  async execute(
    solicitacaoId: number,
    notificacoes: NotificacaoConteudo[],
  ): Promise<void> {
    if (notificacoes.length === 0) return;

    const agora = Date.now();
    const entrega: AgendamentoNotificacao = {
      id: randomUUID(),
      solicitacaoId,
      jobId: '',
      dispararEm: new Date(agora).toISOString(),
      expiraEm: new Date(agora + this.ttlEmMs).toISOString(),
      notificacoes,
      status: StatusAgendamentoNotificacao.ENTREGUE,
    };

    const persistidas =
      await this.notificacaoRepository.persistirNotificacoes(entrega);

    for (const notificacao of persistidas) {
      this.notificacaoEvents.publicarCriada(notificacao);
    }

    this.logger.debug(
      `Entregues ${persistidas.length} notificações da solicitação ${solicitacaoId}.`,
    );
  }
}
