import { DateTime } from 'luxon';

/**
 * Veículo da frota de um fornecedor. O `id` (nCdVeiculo) é sequencial
 * dentro do fornecedor, então só identifica o veículo junto com ele.
 */
export class Veiculo {
  constructor(
    public id: number,
    public fornecedorId: number,
    public tipoVeiculoId: number,
    public placa: string,
    public dataAtivacao: DateTime,
    public modelo?: string,
    public dataDesativacao?: DateTime,
    public tipoVeiculoNome?: string,
    public capacidadePassageiros?: number,
    public fornecedorNome?: string,
  ) {}

  get ativo(): boolean {
    return this.dataDesativacao == null;
  }
}
