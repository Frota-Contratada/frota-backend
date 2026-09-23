import { ApiProperty } from '@nestjs/swagger';
import {
  DashboardAuditoriaPercentual,
  DashboardAuditoriaQuantidade,
  DashboardAuditoriaResponse,
  DashboardAuditoriaValor,
} from '../../../domain/dashboard-auditoria.types';

export class DashboardAuditoriaValorDto {
  @ApiProperty({ example: 54 })
  valor!: number;

  @ApiProperty({ example: 8.5, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardAuditoriaValor) {
    this.valor = indicador.valor;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardAuditoriaQuantidadeDto {
  @ApiProperty({ example: 23 })
  quantidade!: number;

  @ApiProperty({ example: 10, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardAuditoriaQuantidade) {
    this.quantidade = indicador.quantidade;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardAuditoriaPercentualDto {
  @ApiProperty({ example: 10 })
  percentual!: number;

  @ApiProperty({ example: 1.5, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardAuditoriaPercentual) {
    this.percentual = indicador.percentual;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardAuditoriaBigNumbersDto {
  @ApiProperty({ type: DashboardAuditoriaValorDto })
  sobreprecoTotal!: DashboardAuditoriaValorDto;

  @ApiProperty({ type: DashboardAuditoriaQuantidadeDto })
  corridasDesvioAlto!: DashboardAuditoriaQuantidadeDto;

  @ApiProperty({ type: DashboardAuditoriaPercentualDto })
  maiorDesvio!: DashboardAuditoriaPercentualDto;

  @ApiProperty({ type: DashboardAuditoriaQuantidadeDto })
  fornecedoresEmRisco!: DashboardAuditoriaQuantidadeDto;

  constructor(bigNumbers: DashboardAuditoriaResponse['bigNumbers']) {
    this.sobreprecoTotal = new DashboardAuditoriaValorDto(
      bigNumbers.sobreprecoTotal,
    );
    this.corridasDesvioAlto = new DashboardAuditoriaQuantidadeDto(
      bigNumbers.corridasDesvioAlto,
    );
    this.maiorDesvio = new DashboardAuditoriaPercentualDto(
      bigNumbers.maiorDesvio,
    );
    this.fornecedoresEmRisco = new DashboardAuditoriaQuantidadeDto(
      bigNumbers.fornecedoresEmRisco,
    );
  }
}

export class DashboardConformidadeQuilometragemDto {
  @ApiProperty({ example: 'Viex' })
  fornecedor!: string;

  @ApiProperty({ example: 800 })
  kmEstimado!: number;

  @ApiProperty({ example: 650 })
  kmCobrado!: number;

  constructor(
    conformidade: DashboardAuditoriaResponse['conformidadeQuilometragem'][number],
  ) {
    this.fornecedor = conformidade.fornecedor;
    this.kmEstimado = conformidade.kmEstimado;
    this.kmCobrado = conformidade.kmCobrado;
  }
}

export class DashboardDesvioFornecedorDto {
  @ApiProperty({ example: 'Viex' })
  fornecedor!: string;

  @ApiProperty({ example: 68 })
  desvioPercentual!: number;

  constructor(
    desvio: DashboardAuditoriaResponse['maioresDesviosFornecedores'][number],
  ) {
    this.fornecedor = desvio.fornecedor;
    this.desvioPercentual = desvio.desvioPercentual;
  }
}

export class DashboardCorridaAuditadaDto {
  @ApiProperty({ example: '2026-03-13' })
  data!: string;

  @ApiProperty({ example: 'Maria Julia' })
  solicitanteNome!: string;

  @ApiProperty({ example: 'maria.julia@seara.com' })
  solicitanteEmail!: string;

  @ApiProperty({ example: 'Viex' })
  fornecedor!: string;

  @ApiProperty({ example: 2.4 })
  distanciaEstimada!: number;

  @ApiProperty({ example: 2.4 })
  distanciaPercorrida!: number;

  @ApiProperty({
    description: 'Positivo quando o km realizado supera o estimado.',
    example: 15,
  })
  desvioPercentual!: number;

  @ApiProperty({ example: 202.87 })
  preco!: number;

  constructor(corrida: DashboardAuditoriaResponse['corridas'][number]) {
    this.data = corrida.data;
    this.solicitanteNome = corrida.solicitanteNome;
    this.solicitanteEmail = corrida.solicitanteEmail;
    this.fornecedor = corrida.fornecedor;
    this.distanciaEstimada = corrida.distanciaEstimada;
    this.distanciaPercorrida = corrida.distanciaPercorrida;
    this.desvioPercentual = corrida.desvioPercentual;
    this.preco = corrida.preco;
  }
}

export class DashboardAuditoriaDto {
  @ApiProperty({ type: DashboardAuditoriaBigNumbersDto })
  bigNumbers!: DashboardAuditoriaBigNumbersDto;

  @ApiProperty({ type: [DashboardConformidadeQuilometragemDto] })
  conformidadeQuilometragem!: DashboardConformidadeQuilometragemDto[];

  @ApiProperty({ type: [DashboardDesvioFornecedorDto] })
  maioresDesviosFornecedores!: DashboardDesvioFornecedorDto[];

  @ApiProperty({ type: [DashboardCorridaAuditadaDto] })
  corridas!: DashboardCorridaAuditadaDto[];

  constructor(dashboard: DashboardAuditoriaResponse) {
    this.bigNumbers = new DashboardAuditoriaBigNumbersDto(
      dashboard.bigNumbers,
    );
    this.conformidadeQuilometragem = dashboard.conformidadeQuilometragem.map(
      (conformidade) => new DashboardConformidadeQuilometragemDto(conformidade),
    );
    this.maioresDesviosFornecedores = dashboard.maioresDesviosFornecedores.map(
      (desvio) => new DashboardDesvioFornecedorDto(desvio),
    );
    this.corridas = dashboard.corridas.map(
      (corrida) => new DashboardCorridaAuditadaDto(corrida),
    );
  }
}
