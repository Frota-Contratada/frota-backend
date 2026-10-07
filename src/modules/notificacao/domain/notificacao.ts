export enum TipoNotificacao {
  LEMBRETE_VIAGEM = 'LEMBRETE_VIAGEM',
  SOLICITACAO_CRIADA = 'SOLICITACAO_CRIADA',
  SOLICITACAO_AGUARDANDO_FORNECEDOR = 'SOLICITACAO_AGUARDANDO_FORNECEDOR',
  SOLICITACAO_VIROU_CORRIDA = 'SOLICITACAO_VIROU_CORRIDA',
  SOLICITACAO_REPROVADA = 'SOLICITACAO_REPROVADA',
  SOLICITACAO_RECUSADA_FORNECEDOR = 'SOLICITACAO_RECUSADA_FORNECEDOR',
  SOLICITACAO_CANCELADA = 'SOLICITACAO_CANCELADA',
  CORRIDA_CANCELADA = 'CORRIDA_CANCELADA',
}

export enum StatusAgendamentoNotificacao {
  AGENDADA = 'AGENDADA',
  ENTREGANDO = 'ENTREGANDO',
  ENTREGUE = 'ENTREGUE',
  CANCELADA = 'CANCELADA',
}

export interface AcaoNotificacao {
  rota: string;
  parametros?: Record<string, string>;
}

export interface NotificacaoConteudo {
  id: string;
  usuarioId: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  dados?: Record<string, unknown>;
  acao?: AcaoNotificacao;
}

export interface Notificacao extends NotificacaoConteudo {
  agendamentoId: string;
  criadaEm: string;
  expiraEm: string;
  lidaEm: string | null;
}

export interface AgendamentoNotificacao {
  id: string;
  solicitacaoId: number;
  jobId: string;
  dispararEm: string;
  expiraEm: string;
  notificacoes: NotificacaoConteudo[];
  status: StatusAgendamentoNotificacao;
}
