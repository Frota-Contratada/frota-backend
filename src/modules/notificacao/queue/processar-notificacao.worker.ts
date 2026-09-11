import { Injectable } from '@nestjs/common';
import { StatusAgendamentoNotificacao } from '../domain/notificacao';
import { NotificacaoEventsService } from '../gateways/notificacao-events.service';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';
import { JobEntregarNotificacao } from './notificacao-queue.contract';

@Injectable()
export class ProcessarNotificacaoWorker {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
    private readonly notificacaoEvents: NotificacaoEventsService,
  ) {}

  async executar(job: JobEntregarNotificacao): Promise<void> {
    const agendamento = await this.notificacaoRepository.iniciarEntrega(
      job.agendamentoId,
    );
    if (!agendamento) {
      await this.removerNotificacoesDeAgendamentoCancelado(job.agendamentoId);
      return;
    }

    try {
      const notificacoes =
        await this.notificacaoRepository.persistirNotificacoes(agendamento);
      const entregaFinalizada =
        await this.notificacaoRepository.finalizarEntrega(agendamento.id);

      if (!entregaFinalizada) {
        await this.notificacaoRepository.removerNotificacoesDoAgendamento(
          agendamento,
        );
        return;
      }

      for (const notificacao of notificacoes) {
        this.notificacaoEvents.publicarCriada(notificacao);
      }
    } catch (error) {
      await this.notificacaoRepository.liberarEntrega(agendamento.id);
      throw error;
    }
  }

  private async removerNotificacoesDeAgendamentoCancelado(
    agendamentoId: string,
  ): Promise<void> {
    const agendamento = await this.notificacaoRepository.buscarAgendamento(
      agendamentoId,
    );
    if (agendamento?.status !== StatusAgendamentoNotificacao.CANCELADA) {
      return;
    }

    await this.notificacaoRepository.removerNotificacoesDoAgendamento(
      agendamento,
    );
  }
}
