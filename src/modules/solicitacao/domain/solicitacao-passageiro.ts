export class SolicitacaoPassageiro {
  constructor(
    public cpf: string,
    public nome?: string,
    public solicitante: boolean = false,
  ) {}
}
