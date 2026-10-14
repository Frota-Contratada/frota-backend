import { Injectable } from '@nestjs/common';
import { StatusAgendamentoNotificacao } from '../domain/notificacao';
import { NotificacaoEventsService } from '../gateways/notificacao-events.service';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';
import { FiltrarNotificacoesPorPreferenciaService } from '../services/filtrar-notificacoes-por-preferencia.service';
import { JobEntregarNotificacao } from './notificacao-queue.contract';

@Injectable()
export class ProcessarNotificacaoWorker {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
    private readonly notificacaoEvents: NotificacaoEventsService,
    private readonly filtrarPorPreferencia: FiltrarNotificacoesPorPreferenciaService,
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
      const entrega = {
        ...agendamento,
        notificacoes: await this.filtrarPorPreferencia.execute(
          agendamento.notificacoes,
        ),
      };
      const notificacoes =
        entrega.notificacoes.length > 0
          ? await this.notificacaoRepository.persistirNotificacoes(entrega)
          : [];
      const entregaFinalizada =
        await this.notificacaoRepository.finalizarEntrega(agendamento.id);

      if (!entregaFinalizada) {
        await this.notificacaoRepository.removerNotificacoesDoAgendamento(
          entrega,
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
    const agendamento =
      await this.notificacaoRepository.buscarAgendamento(agendamentoId);
    if (agendamento?.status !== StatusAgendamentoNotificacao.CANCELADA) {
      return;
    }

    await this.notificacaoRepository.removerNotificacoesDoAgendamento(
      agendamento,
    );
  }
}
