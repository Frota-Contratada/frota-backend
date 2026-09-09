import { Injectable } from '@nestjs/common';
import { NotificacoesEventsService } from '../gateways/notificacoes-events.service';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';
import { JobEntregarNotificacao } from './notificacoes-queue.contract';

@Injectable()
export class ProcessarNotificacaoWorker {
  constructor(
    private readonly notificacoes: NotificacaoRepositoryContract,
    private readonly events: NotificacoesEventsService,
  ) {}

  async executar(job: JobEntregarNotificacao): Promise<void> {
    const agendamento = await this.notificacoes.iniciarEntrega(
      job.agendamentoId,
    );
    if (!agendamento) return;

    try {
      const notificacoes =
        await this.notificacoes.persistirNotificacoes(agendamento);
      const entregaFinalizada = await this.notificacoes.finalizarEntrega(
        agendamento.id,
      );

      if (!entregaFinalizada) {
        await this.notificacoes.removerNotificacoesDoAgendamento(agendamento);
        return;
      }

      for (const notificacao of notificacoes) {
        this.events.publicarCriada(notificacao);
      }
    } catch (error) {
      await this.notificacoes.liberarEntrega(agendamento.id);
      throw error;
    }
  }
}
