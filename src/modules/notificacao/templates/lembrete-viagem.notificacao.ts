import { NotificacaoConteudo, TipoNotificacao } from '../domain/notificacao';
import { NotificacaoSistema } from './notificacao-sistema';

export { NotificacaoSistema };

export interface ContextoLembreteViagem {
  solicitacaoId: number;
  destinatarioIds: number[];
  dataCorrida: Date;
}

export class LembreteViagemNotificacao extends NotificacaoSistema<ContextoLembreteViagem> {
  readonly tipo = TipoNotificacao.LEMBRETE_VIAGEM;

  preparar(contexto: ContextoLembreteViagem): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Lembrete de viagem',
      mensagem: `Sua viagem está agendada para ${this.formatarDataHora(
        contexto.dataCorrida,
      )}.`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
      },
      acao: {
        rota: '/solicitacoes',
        parametros: {
          solicitacaoId: String(contexto.solicitacaoId),
        },
      },
    });
  }
}

export interface ContextoLembreteViagemIminente extends ContextoLembreteViagem {
  antecedenciaEmMinutos: number;
}

export class LembreteViagemIminenteNotificacao extends NotificacaoSistema<ContextoLembreteViagemIminente> {
  readonly tipo = TipoNotificacao.LEMBRETE_VIAGEM;

  preparar(contexto: ContextoLembreteViagemIminente): NotificacaoConteudo[] {
    return this.paraCadaDestinatario(contexto.destinatarioIds, {
      titulo: 'Sua viagem está chegando',
      mensagem: `Sua viagem começa em ${contexto.antecedenciaEmMinutos} minutos, às ${this.formatarDataHora(
        contexto.dataCorrida,
      )}.`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
        antecedenciaEmMinutos: contexto.antecedenciaEmMinutos,
      },
      acao: {
        rota: '/solicitacoes',
        parametros: {
          solicitacaoId: String(contexto.solicitacaoId),
        },
      },
    });
  }
}
