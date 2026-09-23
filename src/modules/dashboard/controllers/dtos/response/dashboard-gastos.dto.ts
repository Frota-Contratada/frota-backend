import { ApiProperty } from '@nestjs/swagger';
import {
  DashboardGastoIndicador,
  DashboardGastosResponse,
  DashboardTopCentroCusto,
} from '../../../domain/dashboard-gastos.types';

export class DashboardGastoIndicadorDto {
  @ApiProperty({ example: 20000 })
  valor!: number;

  @ApiProperty({ example: 8.5, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardGastoIndicador) {
    this.valor = indicador.valor;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardTopCentroCustoDto {
  @ApiProperty({ example: 101, nullable: true })
  centroCustoId!: number | null;

  @ApiProperty({ example: 'Operações', nullable: true })
  centroCusto!: string | null;

  @ApiProperty({ example: 5200 })
  gasto!: number;

  @ApiProperty({ example: 1.5, nullable: true })
  variacaoPercentual!: number | null;

  constructor(indicador: DashboardTopCentroCusto) {
    this.centroCustoId = indicador.centroCustoId;
    this.centroCusto = indicador.centroCusto;
    this.gasto = indicador.gasto;
    this.variacaoPercentual = indicador.variacaoPercentual;
  }
}

export class DashboardGastosBigNumbersDto {
  @ApiProperty({ type: DashboardGastoIndicadorDto })
  gastoTotal!: DashboardGastoIndicadorDto;

  @ApiProperty({ type: DashboardGastoIndicadorDto })
  precoMedio!: DashboardGastoIndicadorDto;

  @ApiProperty({ type: DashboardTopCentroCustoDto })
  topCentroCusto!: DashboardTopCentroCustoDto;

  @ApiProperty({ type: DashboardGastoIndicadorDto })
  maiorPreco!: DashboardGastoIndicadorDto;

  constructor(bigNumbers: DashboardGastosResponse['bigNumbers']) {
    this.gastoTotal = new DashboardGastoIndicadorDto(bigNumbers.gastoTotal);
    this.precoMedio = new DashboardGastoIndicadorDto(bigNumbers.precoMedio);
    this.topCentroCusto = new DashboardTopCentroCustoDto(
      bigNumbers.topCentroCusto,
    );
    this.maiorPreco = new DashboardGastoIndicadorDto(bigNumbers.maiorPreco);
  }
}

export class DashboardGastoCentroCustoDto {
  @ApiProperty({ example: 101 })
  centroCustoId!: number;

  @ApiProperty({ example: 'RH' })
  centroCusto!: string;

  @ApiProperty({ example: 2000 })
  valor!: number;

  constructor(
    centro: DashboardGastosResponse['maioresGastosCentroCusto'][number],
  ) {
    this.centroCustoId = centro.centroCustoId;
    this.centroCusto = centro.centroCusto;
    this.valor = centro.valor;
  }
}

export class DashboardCentroCustoResumoDto {
  @ApiProperty({ example: 101 })
  centroCustoId!: number;

  @ApiProperty({ example: 'Operações' })
  centroCusto!: string;

  @ApiProperty({ example: 'Marcos Aurélio' })
  responsavel!: string;

  @ApiProperty({ example: 202.87 })
  valor!: number;

  constructor(centro: DashboardGastosResponse['centrosCusto'][number]) {
    this.centroCustoId = centro.centroCustoId;
    this.centroCusto = centro.centroCusto;
    this.responsavel = centro.responsavel;
    this.valor = centro.valor;
  }
}

export class DashboardEvolucaoFornecedorDto {
  @ApiProperty({ example: 'Viex' })
  fornecedor!: string;

  @ApiProperty({ example: 3000 })
  valor!: number;

  constructor(
    fornecedor: DashboardGastosResponse['evolucaoGastos'][number]['fornecedores'][number],
  ) {
    this.fornecedor = fornecedor.fornecedor;
    this.valor = fornecedor.valor;
  }
}

export class DashboardEvolucaoGastoDto {
  @ApiProperty({ example: 'JAN' })
  periodo!: string;

  @ApiProperty({ type: [DashboardEvolucaoFornecedorDto] })
  fornecedores!: DashboardEvolucaoFornecedorDto[];

  constructor(evolucao: DashboardGastosResponse['evolucaoGastos'][number]) {
    this.periodo = evolucao.periodo;
    this.fornecedores = evolucao.fornecedores.map(
      (fornecedor) => new DashboardEvolucaoFornecedorDto(fornecedor),
    );
  }
}

export class DashboardGastosDto {
  @ApiProperty({ type: DashboardGastosBigNumbersDto })
  bigNumbers!: DashboardGastosBigNumbersDto;

  @ApiProperty({ type: [DashboardGastoCentroCustoDto] })
  maioresGastosCentroCusto!: DashboardGastoCentroCustoDto[];

  @ApiProperty({ type: [DashboardCentroCustoResumoDto] })
  centrosCusto!: DashboardCentroCustoResumoDto[];

  @ApiProperty({ type: [DashboardEvolucaoGastoDto] })
  evolucaoGastos!: DashboardEvolucaoGastoDto[];

  constructor(dashboard: DashboardGastosResponse) {
    this.bigNumbers = new DashboardGastosBigNumbersDto(dashboard.bigNumbers);
    this.maioresGastosCentroCusto = dashboard.maioresGastosCentroCusto.map(
      (centro) => new DashboardGastoCentroCustoDto(centro),
    );
    this.centrosCusto = dashboard.centrosCusto.map(
      (centro) => new DashboardCentroCustoResumoDto(centro),
    );
    this.evolucaoGastos = dashboard.evolucaoGastos.map(
      (evolucao) => new DashboardEvolucaoGastoDto(evolucao),
    );
  }
}
