import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CorridaSolicitacao } from '../../../domain/corrida-solicitacao';
import { Parada } from '../../../domain/parada';
import { Solicitacao } from '../../../domain/solicitacao';
import { SolicitacaoCentroCusto } from '../../../domain/solicitacao-centro-custo';
import { SolicitacaoPassageiro } from '../../../domain/solicitacao-passageiro';
import { StatusAprovacao } from '../../../enums/status-aprovacao.enum';
import { StatusCorrida } from '../../../enums/status-corrida.enum';
import { StatusSolicitacao } from '../../../enums/status-solicitacao.enum';
import { CatalogoItemDto } from './catalogo-item.dto';
import { EnderecoDto } from './endereco.dto';

export class ParadaDto {
  @ApiProperty({
    description: 'Posição da parada no trajeto, começando em 1.',
    example: 1,
  })
  ordem: number;

  @ApiProperty({ type: () => EnderecoDto })
  endereco: EnderecoDto;

  @ApiPropertyOptional({
    description: 'Tempo de espera previsto na parada.',
    example: 15,
  })
  tempoParadaMinutos?: number;

  constructor(parada: Parada) {
    this.ordem = parada.ordem;
    this.endereco = new EnderecoDto(parada.endereco);
    this.tempoParadaMinutos = parada.tempoParadaMinutos;
  }
}

export class SolicitacaoCentroCustoDto {
  @ApiProperty({ example: 1 })
  filialId: number;

  @ApiProperty({ example: 101 })
  centroCustoId: number;

  @ApiPropertyOptional({ example: 'Operações' })
  centroCustoNome?: string;

  @ApiProperty({ example: 1003 })
  aprovadorId: number;

  @ApiPropertyOptional({ example: 'Carla Nogueira' })
  aprovadorNome?: string;

  @ApiProperty({
    description:
      'Cada centro de custo aprova de forma independente; a solicitação só é liberada quando todos aprovarem.',
    enum: StatusAprovacao,
    example: StatusAprovacao.PENDENTE,
  })
  statusAprovacao: StatusAprovacao;

  @ApiPropertyOptional({ type: () => CatalogoItemDto })
  motivoRecusa?: CatalogoItemDto;

  constructor(rateio: SolicitacaoCentroCusto) {
    this.filialId = rateio.filialId;
    this.centroCustoId = rateio.centroCustoId;
    this.centroCustoNome = rateio.centroCustoNome;
    this.aprovadorId = rateio.aprovadorId;
    this.aprovadorNome = rateio.aprovadorNome;
    this.statusAprovacao = rateio.statusAprovacao;
    this.motivoRecusa = rateio.motivoRecusa
      ? CatalogoItemDto.aPartirDoMotivo(rateio.motivoRecusa)
      : undefined;
  }
}

export class PassageiroSolicitacaoDto {
  @ApiProperty({ example: '11122233344', minLength: 11, maxLength: 11 })
  cpf: string;

  @ApiPropertyOptional({ example: 'Ana Beatriz Ramos' })
  nome?: string;

  @ApiProperty({
    description: 'Indica o solicitante, que é sempre o primeiro passageiro.',
    example: true,
  })
  solicitante: boolean;

  constructor(passageiro: SolicitacaoPassageiro) {
    this.cpf = passageiro.cpf;
    this.nome = passageiro.nome;
    this.solicitante = passageiro.solicitante;
  }
}

export class CorridaSolicitacaoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: StatusCorrida, example: StatusCorrida.INICIADA })
  status: StatusCorrida;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-18T09:30:00.000-03:00',
  })
  dataInicio: string;

  @ApiPropertyOptional({ format: 'date-time' })
  dataFim?: string;

  @ApiProperty({ example: 1001 })
  motoristaId: number;

  @ApiPropertyOptional({ example: 'Marcos Vinícius Alves' })
  motoristaNome?: string;

  @ApiProperty({ example: 'ABC1D23' })
  placaVeiculo: string;

  @ApiProperty({ example: 12.4 })
  kmPercorrido: number;

  @ApiProperty({ example: 43.46 })
  valorFinal: number;

  @ApiProperty({
    description: 'Corrida iniciada e ainda sem horário de encerramento.',
    example: true,
  })
  emAndamento: boolean;

  constructor(corrida: CorridaSolicitacao) {
    this.id = corrida.id;
    this.status = corrida.status;
    this.dataInicio = corrida.dataInicio.toISO() ?? '';
    this.dataFim = corrida.dataFim?.toISO() ?? undefined;
    this.motoristaId = corrida.motoristaId;
    this.motoristaNome = corrida.motoristaNome;
    this.placaVeiculo = corrida.placaVeiculo;
    this.kmPercorrido = corrida.kmPercorrido;
    this.valorFinal = corrida.valorFinal;
    this.emAndamento = corrida.emAndamento;
  }
}

export class SolicitacaoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    description:
      'Derivado das aprovações dos centros de custo. Uma única recusa reprova a solicitação.',
    enum: StatusSolicitacao,
    example: StatusSolicitacao.PENDENTE,
  })
  status: StatusSolicitacao;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-16T14:02:11.000-03:00',
  })
  dataCriacao: string;

  @ApiProperty({
    description: 'Data e hora da partida.',
    format: 'date-time',
    example: '2026-08-18T09:30:00.000-03:00',
  })
  dataCorrida: string;

  @ApiPropertyOptional({
    description:
      'Calculado a partir da distância no momento da leitura; não é persistido.',
    format: 'date-time',
    example: '2026-08-18T09:50:00.000-03:00',
  })
  dataChegadaEstimada?: string;

  @ApiPropertyOptional({ example: 20 })
  duracaoEstimadaMinutos?: number;

  @ApiProperty({ example: 12.353 })
  distanciaEstimadaKm: number;

  @ApiProperty({
    description:
      'Resultado das regras do contrato vigente mais barato para a filial.',
    example: 43.32,
  })
  valorEstimado: number;

  @ApiProperty({
    description: 'Modalidade contratada: viagem ou transporte de itens.',
    type: () => CatalogoItemDto,
  })
  tipoCorrida: CatalogoItemDto;

  @ApiPropertyOptional({
    description:
      'Ausente quando o solicitante deixa o veículo a critério do fornecedor.',
    type: () => CatalogoItemDto,
  })
  tipoVeiculo?: CatalogoItemDto;

  @ApiProperty({ example: 1002 })
  solicitanteId: number;

  @ApiPropertyOptional({ example: 'Passageiro Teste' })
  solicitanteNome?: string;

  @ApiProperty({ example: 1 })
  fornecedorId: number;

  @ApiPropertyOptional({ example: 'Transportes Aurora' })
  fornecedorNome?: string;

  @ApiProperty({ type: () => EnderecoDto })
  origem: EnderecoDto;

  @ApiProperty({ type: () => EnderecoDto })
  destino: EnderecoDto;

  @ApiProperty({ type: () => [ParadaDto] })
  paradas: ParadaDto[];

  @ApiProperty({
    description:
      'Motivo da corrida no fluxo de viagem, ou o objeto transportado no fluxo de itens.',
    type: () => CatalogoItemDto,
  })
  motivoSolicitacao: CatalogoItemDto;

  @ApiPropertyOptional({ type: () => CatalogoItemDto })
  motivoCancelamento?: CatalogoItemDto;

  @ApiPropertyOptional({
    description:
      'Motivo informado pelo primeiro aprovador que recusou o rateio.',
    type: () => CatalogoItemDto,
  })
  motivoReprovacao?: CatalogoItemDto;

  @ApiProperty({ type: () => [SolicitacaoCentroCustoDto] })
  centrosCusto: SolicitacaoCentroCustoDto[];

  @ApiProperty({
    description: 'Vazio no fluxo de transporte de itens.',
    type: () => [PassageiroSolicitacaoDto],
  })
  passageiros: PassageiroSolicitacaoDto[];

  @ApiPropertyOptional({
    description: 'Presente somente após a atribuição do motorista.',
    type: () => CorridaSolicitacaoDto,
  })
  corrida?: CorridaSolicitacaoDto;

  @ApiProperty({ example: false })
  emAndamento: boolean;

  @ApiProperty({
    description: 'Falso depois que a corrida começa ou o fluxo se encerra.',
    example: true,
  })
  cancelavel: boolean;

  constructor(solicitacao: Solicitacao) {
    this.id = solicitacao.id;
    this.status = solicitacao.status;
    this.dataCriacao = solicitacao.dataCriacao.toISO() ?? '';
    this.dataCorrida = solicitacao.dataCorrida.toISO() ?? '';
    this.dataChegadaEstimada =
      solicitacao.dataChegadaEstimada?.toISO() ?? undefined;
    this.duracaoEstimadaMinutos = solicitacao.duracaoEstimadaMinutos;
    this.distanciaEstimadaKm = solicitacao.distanciaEstimadaKm;
    this.valorEstimado = solicitacao.valorEstimado;
    this.tipoCorrida = CatalogoItemDto.aPartirDoTipoCorrida(
      solicitacao.tipoCorrida,
    );
    this.tipoVeiculo = solicitacao.tipoVeiculo
      ? CatalogoItemDto.aPartirDoTipoVeiculo(solicitacao.tipoVeiculo)
      : undefined;
    this.solicitanteId = solicitacao.solicitanteId;
    this.solicitanteNome = solicitacao.solicitanteNome;
    this.fornecedorId = solicitacao.fornecedorId;
    this.fornecedorNome = solicitacao.fornecedorNome;
    this.origem = new EnderecoDto(solicitacao.origem);
    this.destino = new EnderecoDto(solicitacao.destino);
    this.paradas = solicitacao.paradas.map((parada) => new ParadaDto(parada));
    this.motivoSolicitacao = CatalogoItemDto.aPartirDoMotivo(
      solicitacao.motivoSolicitacao,
    );
    this.motivoCancelamento = solicitacao.motivoCancelamento
      ? CatalogoItemDto.aPartirDoMotivo(solicitacao.motivoCancelamento)
      : undefined;
    this.motivoReprovacao = solicitacao.motivoReprovacao
      ? CatalogoItemDto.aPartirDoMotivo(solicitacao.motivoReprovacao)
      : undefined;
    this.centrosCusto = solicitacao.centrosCusto.map(
      (rateio) => new SolicitacaoCentroCustoDto(rateio),
    );
    this.passageiros = solicitacao.passageiros.map(
      (passageiro) => new PassageiroSolicitacaoDto(passageiro),
    );
    this.corrida = solicitacao.corrida
      ? new CorridaSolicitacaoDto(solicitacao.corrida)
      : undefined;
    this.emAndamento = solicitacao.emAndamento;
    this.cancelavel = solicitacao.cancelavel;
  }

  static aPartirDoDominio(solicitacao: Solicitacao): SolicitacaoDto {
    return new SolicitacaoDto(solicitacao);
  }
}
