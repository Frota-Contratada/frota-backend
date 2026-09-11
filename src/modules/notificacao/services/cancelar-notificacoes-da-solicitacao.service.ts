import { Injectable } from '@nestjs/common';
import { NotificacaoEventsService } from '../gateways/notificacao-events.service';
import { NotificacaoQueueContract } from '../queue/notificacao-queue.contract';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';

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
      const cancelado = await this.notificacaoRepository.cancelarAgendamento(
        agendamento.id,
      );
      if (!cancelado) continue;

      await this.notificacaoQueue.cancelar(cancelado.jobId);
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
