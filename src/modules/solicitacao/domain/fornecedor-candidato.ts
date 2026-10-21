/**
 * Fornecedor com contrato vigente que consegue precificar a solicitação.
 * `selecionado` indica o fornecedor gravado na solicitação.
 */
export class FornecedorCandidato {
  constructor(
    public fornecedorId: number,
    public fornecedorNome: string,
    public contratoId: number,
    public valorEstimado: number,
    public selecionado: boolean,
  ) {}
}
