export interface JobEntregarNotificacao {
  agendamentoId: string;
}

export interface EnfileirarNotificacaoInput {
  agendamentoId: string;
  jobId: string;
  atrasoEmMs: number;
}

export abstract class NotificacaoQueueContract {
  abstract enfileirar(input: EnfileirarNotificacaoInput): Promise<void>;
  abstract cancelar(jobId: string): Promise<void>;
}
