import {
  AgendamentoNotificacao,
  Notificacao,
  StatusAgendamentoNotificacao,
} from '../domain/notificacao';

export abstract class NotificacaoRepositoryContract {
  abstract salvarAgendamento(
    agendamento: AgendamentoNotificacao,
  ): Promise<void>;
  abstract buscarAgendamento(
    agendamentoId: string,
  ): Promise<AgendamentoNotificacao | null>;
  abstract listarAgendamentosDaSolicitacao(
    solicitacaoId: number,
  ): Promise<AgendamentoNotificacao[]>;
  abstract cancelarAgendamento(
    agendamentoId: string,
  ): Promise<AgendamentoNotificacao | null>;
  abstract iniciarEntrega(
    agendamentoId: string,
  ): Promise<AgendamentoNotificacao | null>;
  abstract persistirNotificacoes(
    agendamento: AgendamentoNotificacao,
  ): Promise<Notificacao[]>;
  abstract finalizarEntrega(agendamentoId: string): Promise<boolean>;
  abstract liberarEntrega(agendamentoId: string): Promise<void>;
  abstract removerNotificacoesDoAgendamento(
    agendamento: AgendamentoNotificacao,
  ): Promise<void>;
  abstract listarPorUsuario(
    usuarioId: number,
    limite: number,
  ): Promise<Notificacao[]>;
  abstract contarNaoLidas(usuarioId: number): Promise<number>;
  abstract marcarComoLida(
    usuarioId: number,
    notificacaoId: string,
  ): Promise<Notificacao | null>;
}

export const STATUS_AGENDAMENTO_VALIDOS = new Set<string>(
  Object.values(StatusAgendamentoNotificacao),
);
