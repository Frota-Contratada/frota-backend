import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  AgendamentoNotificacao,
  Notificacao,
  StatusAgendamentoNotificacao,
} from '../domain/notificacao';
import { NotificacoesEventsService } from '../gateways/notificacoes-events.service';
import { NotificacoesQueueContract } from '../queue/notificacoes-queue.contract';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';
import {
  ContextoLembreteViagem,
  LembreteViagemNotificacao,
} from '../templates/lembrete-viagem.notificacao';

export interface AgendarLembreteDaSolicitacaoInput {
  solicitacaoId: number;
  destinatarioIds: number[];
  dataCorrida: Date;
  dispararEm?: Date;
}

@Injectable()
export class NotificacoesService {
  private readonly templateLembreteViagem = new LembreteViagemNotificacao();
  private readonly ttlEmMs: number;
  private readonly antecedenciaEmMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificacoes: NotificacaoRepositoryContract,
    private readonly queue: NotificacoesQueueContract,
    private readonly events: NotificacoesEventsService,
  ) {
    this.ttlEmMs = this.valorPositivo('NOTIFICACOES_TTL_DIAS', 30) * 86_400_000;
    this.antecedenciaEmMs =
      this.valorPositivo('NOTIFICACOES_ANTECEDENCIA_MINUTOS', 120) * 60_000;
  }

  async agendarLembreteDaSolicitacao(
    input: AgendarLembreteDaSolicitacaoInput,
  ): Promise<void> {
    if (!Number.isInteger(input.solicitacaoId) || input.solicitacaoId <= 0) {
      throw new BadRequestException('Solicitação inválida para agendamento.');
    }
    if (Number.isNaN(input.dataCorrida.getTime())) {
      throw new BadRequestException('A data da corrida é inválida.');
    }

    await this.cancelarDaSolicitacao(input.solicitacaoId);

    if (input.dataCorrida.getTime() <= Date.now()) return;

    const dispararEm =
      input.dispararEm ??
      new Date(input.dataCorrida.getTime() - this.antecedenciaEmMs);
    if (Number.isNaN(dispararEm.getTime())) {
      throw new BadRequestException('A data do lembrete é inválida.');
    }

    const contexto: ContextoLembreteViagem = {
      solicitacaoId: input.solicitacaoId,
      destinatarioIds: input.destinatarioIds,
      dataCorrida: input.dataCorrida,
    };
    const notificacoes = this.templateLembreteViagem.preparar(contexto);
    if (notificacoes.length === 0) return;

    const agora = Date.now();
    const agendamentoId = randomUUID();
    const agendamento: AgendamentoNotificacao = {
      id: agendamentoId,
      solicitacaoId: input.solicitacaoId,
      jobId: `notificacao:${agendamentoId}`,
      dispararEm: dispararEm.toISOString(),
      expiraEm: new Date(
        Math.max(dispararEm.getTime(), agora) + this.ttlEmMs,
      ).toISOString(),
      notificacoes,
      status: StatusAgendamentoNotificacao.AGENDADA,
    };

    await this.notificacoes.salvarAgendamento(agendamento);

    try {
      await this.queue.enfileirar({
        agendamentoId: agendamento.id,
        jobId: agendamento.jobId,
        atrasoEmMs: dispararEm.getTime() - agora,
      });
    } catch (error) {
      await this.notificacoes.cancelarAgendamento(agendamento.id);
      throw error;
    }
  }

  async cancelarDaSolicitacao(solicitacaoId: number): Promise<void> {
    const agendamentos =
      await this.notificacoes.listarAgendamentosDaSolicitacao(solicitacaoId);

    for (const agendamento of agendamentos) {
      const cancelado = await this.notificacoes.cancelarAgendamento(
        agendamento.id,
      );
      if (!cancelado) continue;

      await Promise.all([
        this.queue.cancelar(cancelado.jobId),
        this.notificacoes.removerNotificacoesDoAgendamento(cancelado),
      ]);

      for (const notificacao of cancelado.notificacoes) {
        this.events.publicarRemovida(notificacao.usuarioId, notificacao.id);
      }
    }
  }

  listarPorUsuario(usuarioId: number): Promise<Notificacao[]> {
    return this.notificacoes.listarPorUsuario(usuarioId, 50);
  }

  contarNaoLidas(usuarioId: number): Promise<number> {
    return this.notificacoes.contarNaoLidas(usuarioId);
  }

  marcarComoLida(
    usuarioId: number,
    notificacaoId: string,
  ): Promise<Notificacao | null> {
    return this.notificacoes.marcarComoLida(usuarioId, notificacaoId);
  }

  private valorPositivo(chave: string, padrao: number): number {
    const valor = Number(this.configService.get<string>(chave) ?? padrao);
    return Number.isFinite(valor) && valor > 0 ? valor : padrao;
  }
}
