import { Injectable, Logger } from '@nestjs/common';
import { NotificacaoConteudo } from '../domain/notificacao';
import {
  ContextoEventoSolicitacao,
  CorridaCanceladaNotificacao,
  SolicitacaoAguardandoFornecedorNotificacao,
  SolicitacaoCanceladaNotificacao,
  SolicitacaoCriadaNotificacao,
  SolicitacaoRecusadaPeloFornecedorNotificacao,
  SolicitacaoReprovadaNotificacao,
  SolicitacaoVirouCorridaNotificacao,
} from '../templates/eventos-solicitacao.notificacao';
import { AgendarLembreteDaSolicitacaoService } from './agendar-lembrete-da-solicitacao.service';
import { EnviarNotificacaoService } from './enviar-notificacao.service';
import {
  EnvolvidosDaSolicitacao,
  ResolverEnvolvidosDaSolicitacaoService,
} from './resolver-envolvidos-da-solicitacao.service';

/**
 * Ponto único de disparo das notificações do ciclo de vida da solicitação.
 *
 * Todos os métodos são best-effort: uma falha ao notificar é registrada no log
 * e nunca derruba a operação de negócio que a originou.
 */
@Injectable()
export class NotificarSolicitacaoService {
  private readonly logger = new Logger(NotificarSolicitacaoService.name);

  private readonly solicitacaoCriadaTemplate =
    new SolicitacaoCriadaNotificacao();
  private readonly aguardandoFornecedorTemplate =
    new SolicitacaoAguardandoFornecedorNotificacao();
  private readonly virouCorridaTemplate =
    new SolicitacaoVirouCorridaNotificacao();
  private readonly reprovadaTemplate = new SolicitacaoReprovadaNotificacao();
  private readonly recusadaTemplate =
    new SolicitacaoRecusadaPeloFornecedorNotificacao();
  private readonly canceladaTemplate = new SolicitacaoCanceladaNotificacao();
  private readonly corridaCanceladaTemplate = new CorridaCanceladaNotificacao();

  constructor(
    private readonly resolverEnvolvidos: ResolverEnvolvidosDaSolicitacaoService,
    private readonly enviarNotificacao: EnviarNotificacaoService,
    private readonly agendarLembrete: AgendarLembreteDaSolicitacaoService,
  ) {}

  /** Avisa os aprovadores dos centros de custo de que há algo para aprovar. */
  async solicitacaoCriada(solicitacaoId: number): Promise<void> {
    await this.disparar(solicitacaoId, 'criada', (envolvidos) =>
      this.solicitacaoCriadaTemplate.preparar({
        ...this.contextoBase(envolvidos),
        destinatarioIds: envolvidos.aprovadorIds,
      }),
    );
  }

  /** Avisa o fornecedor de que a solicitação foi aprovada e aguarda decisão. */
  async solicitacaoAguardandoFornecedor(solicitacaoId: number): Promise<void> {
    await this.disparar(solicitacaoId, 'aguardando fornecedor', (envolvidos) =>
      this.aguardandoFornecedorTemplate.preparar({
        ...this.contextoBase(envolvidos),
        destinatarioIds: envolvidos.fornecedorIds,
      }),
    );
  }

  /** Avisa solicitante e motorista de que a solicitação virou corrida. */
  async solicitacaoVirouCorrida(solicitacaoId: number): Promise<void> {
    await this.disparar(solicitacaoId, 'virou corrida', (envolvidos) => {
      if (envolvidos.corridaId == null) return [];

      return this.virouCorridaTemplate.preparar({
        ...this.contextoBase(envolvidos),
        destinatarioIds: [
          envolvidos.solicitanteId,
          ...(envolvidos.motoristaId == null ? [] : [envolvidos.motoristaId]),
        ],
        corridaId: envolvidos.corridaId,
        placaVeiculo: envolvidos.placaVeiculo,
      });
    });
  }

  async solicitacaoReprovada(
    solicitacaoId: number,
    opcoes: { aprovadorId?: number; motivo?: string } = {},
  ): Promise<void> {
    await this.disparar(solicitacaoId, 'reprovada', (envolvidos) =>
      this.reprovadaTemplate.preparar({
        ...this.contextoBase(envolvidos),
        destinatarioIds: this.todosEnvolvidos(envolvidos, opcoes.aprovadorId),
        motivo: opcoes.motivo,
      }),
    );
  }

  async solicitacaoRecusadaPeloFornecedor(
    solicitacaoId: number,
    motivo?: string,
  ): Promise<void> {
    await this.disparar(
      solicitacaoId,
      'recusada pelo fornecedor',
      (envolvidos) =>
        this.recusadaTemplate.preparar({
          ...this.contextoBase(envolvidos),
          destinatarioIds: this.todosEnvolvidos(envolvidos),
          motivo,
        }),
    );
  }

  async solicitacaoCancelada(
    solicitacaoId: number,
    opcoes: { canceladaPorId?: number; motivo?: string } = {},
  ): Promise<void> {
    await this.disparar(solicitacaoId, 'cancelada', (envolvidos) =>
      this.canceladaTemplate.preparar({
        ...this.contextoBase(envolvidos),
        destinatarioIds: this.todosEnvolvidos(
          envolvidos,
          opcoes.canceladaPorId,
        ),
        motivo: opcoes.motivo,
      }),
    );
  }

  async corridaCancelada(
    solicitacaoId: number,
    opcoes: { canceladaPorId?: number; motivo?: string } = {},
  ): Promise<void> {
    await this.disparar(
      solicitacaoId,
      'corrida cancelada',
      (envolvidos) => {
        if (envolvidos.corridaId == null) return [];

        return this.corridaCanceladaTemplate.preparar({
          ...this.contextoBase(envolvidos),
          destinatarioIds: this.todosEnvolvidos(
            envolvidos,
            opcoes.canceladaPorId,
          ),
          corridaId: envolvidos.corridaId,
          motivo: opcoes.motivo,
        });
      },
      { incluirCorridasCanceladas: true },
    );
  }

  /**
   * Agenda os lembretes da viagem: o antecipado para solicitante e motorista,
   * e o de véspera para motorista e passageiros.
   */
  async agendarLembretesDaCorrida(solicitacaoId: number): Promise<void> {
    try {
      const envolvidos = await this.resolverEnvolvidos.execute(solicitacaoId);
      if (envolvidos == null) return;

      const motorista =
        envolvidos.motoristaId == null ? [] : [envolvidos.motoristaId];

      await this.agendarLembrete.execute({
        solicitacaoId,
        dataCorrida: envolvidos.dataCorrida,
        destinatarioIds: [envolvidos.solicitanteId, ...motorista],
        destinatariosLembreteFinal: [...motorista, ...envolvidos.passageiroIds],
      });
    } catch (error) {
      this.logger.error(
        `Falha ao agendar os lembretes da solicitação ${solicitacaoId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private contextoBase(
    envolvidos: EnvolvidosDaSolicitacao,
  ): ContextoEventoSolicitacao {
    return {
      solicitacaoId: envolvidos.solicitacaoId,
      destinatarioIds: [],
      dataCorrida: envolvidos.dataCorrida,
      solicitanteNome: envolvidos.solicitanteNome,
    };
  }

  private todosEnvolvidos(
    envolvidos: EnvolvidosDaSolicitacao,
    excetoUsuarioId?: number,
  ): number[] {
    return [
      envolvidos.solicitanteId,
      ...envolvidos.aprovadorIds,
      ...envolvidos.fornecedorIds,
      ...envolvidos.passageiroIds,
      ...(envolvidos.motoristaId == null ? [] : [envolvidos.motoristaId]),
    ].filter((usuarioId) => usuarioId !== excetoUsuarioId);
  }

  private async disparar(
    solicitacaoId: number,
    evento: string,
    montar: (envolvidos: EnvolvidosDaSolicitacao) => NotificacaoConteudo[],
    opcoes?: { incluirCorridasCanceladas?: boolean },
  ): Promise<void> {
    try {
      const envolvidos = await this.resolverEnvolvidos.execute(
        solicitacaoId,
        opcoes,
      );
      if (envolvidos == null) return;

      await this.enviarNotificacao.execute(solicitacaoId, montar(envolvidos));
    } catch (error) {
      this.logger.error(
        `Falha ao notificar "${evento}" da solicitação ${solicitacaoId}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
