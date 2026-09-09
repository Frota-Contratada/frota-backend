export enum RespostaPergunta {
  SIM = 'SIM',
  NAO = 'NAO',
}

/** Resposta recebida no payload antes de o contrato ser selecionado. */
export interface RespostaPerguntaPrecificacao {
  contratoId: number;
  perguntaId: number;
  resposta: RespostaPergunta;
}

/** Resposta vinculada a uma solicitação já associada a um contrato. */
export class RespostaPerguntaSolicitacao {
  constructor(
    public perguntaId: number,
    public resposta: RespostaPergunta,
  ) {}
}
