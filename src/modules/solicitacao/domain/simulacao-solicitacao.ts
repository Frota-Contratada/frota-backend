import { DateTime } from 'luxon';

export class SimulacaoSolicitacao {
  constructor(
    public distanciaEstimadaKm: number,
    public duracaoEstimadaMinutos: number,
    public dataCorrida: DateTime,
    public valorEstimado: number,
    public fornecedorId: number,
    public fornecedorNome: string,
  ) {}

  get dataChegadaEstimada(): DateTime {
    return this.dataCorrida.plus({ minutes: this.duracaoEstimadaMinutos });
  }
}
