import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MotoristaCorrida } from '../../../domain/motorista-corrida';

class MotoristaCorridaParadaDto {
  @ApiProperty({ example: 1 })
  ordem: number;

  @ApiProperty({ example: 'Rua Paraná, 100 - Centro' })
  endereco: string;

  @ApiProperty({ example: -23.3045 })
  latitude: number;

  @ApiProperty({ example: -51.1696 })
  longitude: number;
}

export class MotoristaCorridaDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ format: 'date-time' })
  dataHoraPartida: string;

  @ApiProperty({ example: 'Rua Pernambuco, 540 - Centro' })
  origem: string;

  @ApiProperty({ example: 'Avenida Santos Dumont, 100 - Aeroporto' })
  destino: string;

  @ApiProperty({ type: () => [MotoristaCorridaParadaDto] })
  paradas: MotoristaCorridaParadaDto[];

  @ApiProperty({ example: 'Ana Beatriz Ramos' })
  nomePassageiro: string;

  @ApiProperty({ example: 43.32 })
  valorEstimado: number;

  @ApiProperty({ example: 'Viagem' })
  tipoCorrida: string;

  @ApiProperty({ example: 'A' })
  status: string;

  @ApiProperty({ example: 'ABC1D23' })
  placaVeiculo?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  dataFim?: string;

  @ApiProperty({ example: true })
  ehProxima: boolean;

  @ApiPropertyOptional({ example: 18 })
  minutosRestantes?: number;

  @ApiPropertyOptional({
    example: 'Não consigo realizar o atendimento no horário informado.',
  })
  motivoRecusa?: string;

  constructor(corrida: MotoristaCorrida) {
    this.id = corrida.id;
    this.dataHoraPartida = corrida.dataHoraPartida.toISO() ?? '';
    this.origem = corrida.origem;
    this.destino = corrida.destino;
    this.paradas = corrida.paradas;
    this.nomePassageiro = corrida.nomePassageiro;
    this.valorEstimado = corrida.valorEstimado;
    this.tipoCorrida = corrida.tipoCorrida;
    this.status = corrida.status;
    this.placaVeiculo = corrida.placaVeiculo;
    this.dataFim = corrida.dataFim?.toISO() ?? undefined;
    this.ehProxima = corrida.ehProxima;
    this.minutosRestantes = corrida.minutosRestantes;
    this.motivoRecusa = corrida.motivoRecusa;
  }
}
