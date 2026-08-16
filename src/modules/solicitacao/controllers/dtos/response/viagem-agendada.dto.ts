import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Solicitacao } from '../../../domain/solicitacao';
import { StatusViagem } from '../../../enums/status-viagem.enum';

export class ViagemAgendadaDto {
  @ApiProperty({ example: 1 })
  solicitacaoId: number;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-18T09:30:00.000-03:00',
  })
  dataHoraPartida: string;

  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-08-18T09:50:00.000-03:00',
  })
  dataChegadaEstimada?: string;

  @ApiProperty({ example: 'Rua Pernambuco, 540 - Centro' })
  origem: string;

  @ApiProperty({ example: 'Avenida Santos Dumont, 100 - Aeroporto' })
  destino: string;

  @ApiProperty({
    description:
      'Derivado da existência de uma corrida em execução para a solicitação.',
    enum: StatusViagem,
    example: StatusViagem.AGENDADA,
  })
  status: StatusViagem;

  @ApiProperty({ example: 'Táxi' })
  tipoCorrida: string;

  @ApiProperty({ example: 43.32 })
  valorEstimado: number;

  @ApiPropertyOptional({
    description: 'Disponível após a atribuição do motorista.',
    example: 'Marcos Vinícius Alves',
  })
  motoristaNome?: string;

  @ApiPropertyOptional({ example: 'ABC1D23' })
  placaVeiculo?: string;

  constructor(solicitacao: Solicitacao) {
    this.solicitacaoId = solicitacao.id;
    this.dataHoraPartida = solicitacao.dataCorrida.toISO() ?? '';
    this.dataChegadaEstimada =
      solicitacao.dataChegadaEstimada?.toISO() ?? undefined;
    this.origem = solicitacao.origem.descricao;
    this.destino = solicitacao.destino.descricao;
    this.status = solicitacao.emAndamento
      ? StatusViagem.EM_ANDAMENTO
      : StatusViagem.AGENDADA;
    this.tipoCorrida = solicitacao.tipoCorrida.nome;
    this.valorEstimado = solicitacao.valorEstimado;
    this.motoristaNome = solicitacao.corrida?.motoristaNome;
    this.placaVeiculo = solicitacao.corrida?.placaVeiculo;
  }

  static aPartirDoDominio(solicitacao: Solicitacao): ViagemAgendadaDto {
    return new ViagemAgendadaDto(solicitacao);
  }
}
