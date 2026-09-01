import { ApiProperty } from '@nestjs/swagger';
import { SimulacaoSolicitacao } from '../../../domain/simulacao-solicitacao';

export class SimulacaoSolicitacaoDto {
  @ApiProperty({ example: 12.353 })
  distanciaEstimadaKm: number;

  @ApiProperty({ example: 15 })
  duracaoEstimadaMinutos: number;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-18T09:45:00.000-03:00',
  })
  dataChegadaEstimada: string;

  @ApiProperty({
    description:
      'Resultado das regras do contrato vigente mais barato para a filial.',
    example: 43.32,
  })
  valorEstimado: number;

  @ApiProperty({ example: 1 })
  fornecedorId: number;

  @ApiProperty({ example: 'Transportes Aurora' })
  fornecedorNome: string;

  constructor(simulacao: SimulacaoSolicitacao) {
    this.distanciaEstimadaKm = simulacao.distanciaEstimadaKm;
    this.duracaoEstimadaMinutos = simulacao.duracaoEstimadaMinutos;
    this.dataChegadaEstimada = simulacao.dataChegadaEstimada.toISO() ?? '';
    this.valorEstimado = simulacao.valorEstimado;
    this.fornecedorId = simulacao.fornecedorId;
    this.fornecedorNome = simulacao.fornecedorNome;
  }

  static aPartirDoDominio(
    simulacao: SimulacaoSolicitacao,
  ): SimulacaoSolicitacaoDto {
    return new SimulacaoSolicitacaoDto(simulacao);
  }
}
