import { Injectable } from '@nestjs/common';
import { StatusAgendamentoNotificacao } from '../domain/notificacao';
import { NotificacaoEventsService } from '../gateways/notificacao-events.service';
import { NotificacaoQueueContract } from '../queue/notificacao-queue.contract';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';

/**
 * Cancela apenas o que ainda não chegou ao usuário. Notificações já entregues
 * ficam no histórico — um lembrete que o usuário leu não some porque a
 * solicitação foi cancelada depois.
 */
@Injectable()
export class CancelarNotificacoesDaSolicitacaoService {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
    private readonly notificacaoQueue: NotificacaoQueueContract,
    private readonly notificacaoEvents: NotificacaoEventsService,
  ) {}

  async execute(solicitacaoId: number): Promise<void> {
    const agendamentos =
      await this.notificacaoRepository.listarAgendamentosDaSolicitacao(
        solicitacaoId,
      );

    for (const agendamento of agendamentos) {
      if (agendamento.status === StatusAgendamentoNotificacao.ENTREGUE) {
        continue;
      }

      const cancelado = await this.notificacaoRepository.cancelarAgendamento(
        agendamento.id,
      );
      if (!cancelado) continue;

      await this.notificacaoQueue.cancelar(cancelado.jobId);
      // O agendamento pode ter sido persistido por um worker em voo entre a
      // listagem e o cancelamento; limpar garante que nada vaze.
      await this.notificacaoRepository.removerNotificacoesDoAgendamento(
        cancelado,
      );

      for (const notificacao of cancelado.notificacoes) {
        this.notificacaoEvents.publicarRemovida(
          notificacao.usuarioId,
          notificacao.id,
        );
      }
    }
  }
}
