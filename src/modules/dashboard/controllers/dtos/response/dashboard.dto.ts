import { ApiProperty } from '@nestjs/swagger';
import {
  DashboardBigNumber,
  DashboardResponse,
  DashboardTopFornecedor,
} from '../../../domain/dashboard.types';

export class DashboardBigNumberDto {
  @ApiProperty({ example: 42 })
  valor!: number;

  @ApiProperty({ example: 12.5, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardBigNumber) {
    this.valor = indicador.valor;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardTopFornecedorDto {
  @ApiProperty({ example: 'Viex', nullable: true })
  fornecedor!: string | null;

  @ApiProperty({ example: 15000 })
  gasto!: number;

  @ApiProperty({ example: -5.25, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardTopFornecedor) {
    this.fornecedor = indicador.fornecedor;
    this.gasto = indicador.gasto;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardBigNumbersDto {
  @ApiProperty({ type: DashboardBigNumberDto })
  totalCorridas!: DashboardBigNumberDto;

  @ApiProperty({ type: DashboardBigNumberDto })
  corridasConcluidas!: DashboardBigNumberDto;

  @ApiProperty({ type: DashboardBigNumberDto })
  corridasEmergenciais!: DashboardBigNumberDto;

  @ApiProperty({ type: DashboardTopFornecedorDto })
  top1FornecedorPorGasto!: DashboardTopFornecedorDto;

  constructor(bigNumbers: DashboardResponse['bigNumbers']) {
    this.totalCorridas = new DashboardBigNumberDto(bigNumbers.totalCorridas);
    this.corridasConcluidas = new DashboardBigNumberDto(
      bigNumbers.corridasConcluidas,
    );
    this.corridasEmergenciais = new DashboardBigNumberDto(
      bigNumbers.corridasEmergenciais,
    );
    this.top1FornecedorPorGasto = new DashboardTopFornecedorDto(
      bigNumbers.top1FornecedorPorGasto,
    );
  }
}

export class DashboardGastoMensalDto {
  @ApiProperty({ example: 'JAN' })
  mes!: string;

  @ApiProperty({ example: 120000 })
  gasto!: number;

  constructor(gastoMensal: DashboardResponse['gastoMensal'][number]) {
    this.mes = gastoMensal.mes;
    this.gasto = gastoMensal.gasto;
  }
}

export class DashboardGastoFornecedorDto {
  @ApiProperty({ example: 'Viex' })
  fornecedor!: string;

  @ApiProperty({ example: 15000 })
  gasto!: number;

  constructor(
    gasto: DashboardResponse['gastoPorFornecedor']['fornecedores'][number],
  ) {
    this.fornecedor = gasto.fornecedor;
    this.gasto = gasto.gasto;
  }
}

export class DashboardGastoPorFornecedorDto {
  @ApiProperty({ example: 33000 })
  total!: number;

  @ApiProperty({ type: [DashboardGastoFornecedorDto] })
  fornecedores!: DashboardGastoFornecedorDto[];

  constructor(gastoPorFornecedor: DashboardResponse['gastoPorFornecedor']) {
    this.total = gastoPorFornecedor.total;
    this.fornecedores = gastoPorFornecedor.fornecedores.map(
      (gasto) => new DashboardGastoFornecedorDto(gasto),
    );
  }
}

export class DashboardCorridaDto {
  @ApiProperty({ example: '2026-03-13' })
  data!: string;

  @ApiProperty({ example: 'Maria Julia' })
  solicitanteNome!: string;

  @ApiProperty({ example: 'maria.julia@seara.com' })
  solicitanteEmail!: string;

  @ApiProperty({ example: 'Fórum de Amparo' })
  destino!: string;

  @ApiProperty({ example: 'CONCLUIDO' })
  status!: string;

  @ApiProperty({ example: 2.4 })
  distanciaEstimada!: number;

  @ApiProperty({ example: 2.4 })
  distanciaPercorrida!: number;

  @ApiProperty({ example: 202.87 })
  preco!: number;

  constructor(corrida: DashboardResponse['corridas'][number]) {
    this.data = corrida.data;
    this.solicitanteNome = corrida.solicitanteNome;
    this.solicitanteEmail = corrida.solicitanteEmail;
    this.destino = corrida.destino;
    this.status = corrida.status;
    this.distanciaEstimada = corrida.distanciaEstimada;
    this.distanciaPercorrida = corrida.distanciaPercorrida;
    this.preco = corrida.preco;
  }
}

export class DashboardDto {
  @ApiProperty({ type: DashboardBigNumbersDto })
  bigNumbers!: DashboardBigNumbersDto;

  @ApiProperty({ type: [DashboardGastoMensalDto] })
  gastoMensal!: DashboardGastoMensalDto[];

  @ApiProperty({ type: DashboardGastoPorFornecedorDto })
  gastoPorFornecedor!: DashboardGastoPorFornecedorDto;

  @ApiProperty({ type: [DashboardCorridaDto] })
  corridas!: DashboardCorridaDto[];

  constructor(dashboard: DashboardResponse) {
    this.bigNumbers = new DashboardBigNumbersDto(dashboard.bigNumbers);
    this.gastoMensal = dashboard.gastoMensal.map(
      (gasto) => new DashboardGastoMensalDto(gasto),
    );
    this.gastoPorFornecedor = new DashboardGastoPorFornecedorDto(
      dashboard.gastoPorFornecedor,
    );
    this.corridas = dashboard.corridas.map(
      (corrida) => new DashboardCorridaDto(corrida),
    );
  }
}
