import { ContratoBigNumbers } from '../../../domain/types/contrato-big-numbers.type';

export class ContratoBigNumbersDto {
  total: number;
  validos: number;
  vencemEmBreve: number;
  vencidos: number;

  constructor(bigNumbers: ContratoBigNumbers) {
    this.total = bigNumbers.total;
    this.validos = bigNumbers.validos;
    this.vencemEmBreve = bigNumbers.vencemEmBreve;
    this.vencidos = bigNumbers.vencidos;
  }
}
