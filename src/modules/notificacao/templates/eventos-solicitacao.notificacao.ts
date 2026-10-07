import { NotificacaoConteudo, TipoNotificacao } from '../domain/notificacao';
import { NotificacaoSistema } from './notificacao-sistema';

export interface ContextoEventoSolicitacao {
  solicitacaoId: number;
  destinatarioIds: number[];
  dataCorrida: Date;
  solicitanteNome?: string;
  motivo?: string;
}

function acaoDaSolicitacao(solicitacaoId: number) {
  return {
    rota: '/solicitacoes',
    parametros: { solicitacaoId: String(solicitacaoId) },
  };
}

export class SolicitacaoCriadaNotificacao extends NotificacaoSistema<ContextoEventoSolicitacao> {
  readonly tipo = TipoNotificacao.SOLICITACAO_CRIADA;

  preparar(contexto: ContextoEventoSolicitacao): NotificacaoConteudo[] {
    const solicitante = contexto.solicitanteNome ?? 'Um solicitante';

    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Nova solicitação para aprovar',
      mensagem: `${solicitante} criou uma solicitação para ${this.formatarDataHora(
        contexto.dataCorrida,
      )} e ela aguarda a sua aprovação.`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

export class SolicitacaoAguardandoFornecedorNotificacao extends NotificacaoSistema<ContextoEventoSolicitacao> {
  readonly tipo = TipoNotificacao.SOLICITACAO_AGUARDANDO_FORNECEDOR;

  preparar(contexto: ContextoEventoSolicitacao): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Nova solicitação aprovada',
      mensagem: `Uma solicitação para ${this.formatarDataHora(
        contexto.dataCorrida,
      )} foi aprovada e aguarda a sua decisão.`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

export interface ContextoSolicitacaoVirouCorrida extends ContextoEventoSolicitacao {
  corridaId: number;
  motoristaNome?: string;
  placaVeiculo?: string;
}

export class SolicitacaoVirouCorridaNotificacao extends NotificacaoSistema<ContextoSolicitacaoVirouCorrida> {
  readonly tipo = TipoNotificacao.SOLICITACAO_VIROU_CORRIDA;

  preparar(contexto: ContextoSolicitacaoVirouCorrida): NotificacaoConteudo[] {
    const veiculo = contexto.placaVeiculo
      ? ` Veículo ${contexto.placaVeiculo}.`
      : '';

    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Corrida confirmada',
      mensagem: `A solicitação virou uma corrida agendada para ${this.formatarDataHora(
        contexto.dataCorrida,
      )}.${veiculo}`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        corridaId: contexto.corridaId,
        dataCorrida: contexto.dataCorrida.toISOString(),
        motoristaNome: contexto.motoristaNome,
        placaVeiculo: contexto.placaVeiculo,
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

export class SolicitacaoReprovadaNotificacao extends NotificacaoSistema<ContextoEventoSolicitacao> {
  readonly tipo = TipoNotificacao.SOLICITACAO_REPROVADA;

  preparar(contexto: ContextoEventoSolicitacao): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Solicitação reprovada',
      mensagem: `A solicitação de ${this.formatarDataHora(
        contexto.dataCorrida,
      )} foi reprovada pelo aprovador.${motivoEmTexto(contexto.motivo)}`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
        motivo: contexto.motivo,
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

export class SolicitacaoRecusadaPeloFornecedorNotificacao extends NotificacaoSistema<ContextoEventoSolicitacao> {
  readonly tipo = TipoNotificacao.SOLICITACAO_RECUSADA_FORNECEDOR;

  preparar(contexto: ContextoEventoSolicitacao): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Solicitação recusada pelo fornecedor',
      mensagem: `O fornecedor recusou a solicitação de ${this.formatarDataHora(
        contexto.dataCorrida,
      )}.${motivoEmTexto(contexto.motivo)}`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
        motivo: contexto.motivo,
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

export class SolicitacaoCanceladaNotificacao extends NotificacaoSistema<ContextoEventoSolicitacao> {
  readonly tipo = TipoNotificacao.SOLICITACAO_CANCELADA;

  preparar(contexto: ContextoEventoSolicitacao): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Solicitação cancelada',
      mensagem: `A solicitação de ${this.formatarDataHora(
        contexto.dataCorrida,
      )} foi cancelada.${motivoEmTexto(contexto.motivo)}`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
        motivo: contexto.motivo,
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

export interface ContextoCorridaCancelada extends ContextoEventoSolicitacao {
  corridaId: number;
}

export class CorridaCanceladaNotificacao extends NotificacaoSistema<ContextoCorridaCancelada> {
  readonly tipo = TipoNotificacao.CORRIDA_CANCELADA;

  preparar(contexto: ContextoCorridaCancelada): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Corrida cancelada',
      mensagem: `A corrida de ${this.formatarDataHora(
        contexto.dataCorrida,
      )} foi cancelada.${motivoEmTexto(contexto.motivo)}`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        corridaId: contexto.corridaId,
        dataCorrida: contexto.dataCorrida.toISOString(),
        motivo: contexto.motivo,
      },
      acao: acaoDaSolicitacao(contexto.solicitacaoId),
    });
  }
}

function motivoEmTexto(motivo?: string): string {
  return motivo ? ` Motivo: ${motivo}.` : '';
}
