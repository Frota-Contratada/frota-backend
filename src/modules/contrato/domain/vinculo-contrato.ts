/**
 * Vínculo do contrato com a filial atendida e o fornecedor contratado,
 * persistido em FilialFornecedor. É por ele que o contrato entra na
 * precificação das solicitações da filial.
 */
export class VinculoContrato {
  constructor(
    public empresaId: number,
    public filialId: number,
    public fornecedorId: number,
  ) {}
}
