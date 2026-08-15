import { FornecedorBigNumbers } from '../../../domain/types/fornecedor-big-numbers.type';

export class FornecedorBigNumbersDto {
  fornecedoresAtivos: number;
  fornecedoresComContratoVigente: number;
  fornecedoresSemContratoVigente: number;
  veiculosAtivos: number;

  constructor(bigNumbers: FornecedorBigNumbers) {
    this.fornecedoresAtivos = bigNumbers.fornecedoresAtivos;
    this.fornecedoresComContratoVigente =
      bigNumbers.fornecedoresComContratoVigente;
    this.fornecedoresSemContratoVigente =
      bigNumbers.fornecedoresSemContratoVigente;
    this.veiculosAtivos = bigNumbers.veiculosAtivos;
  }
}
