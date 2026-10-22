import { ApiProperty } from '@nestjs/swagger';
import { TipoDespesa } from '../../../domain/tipo-despesa';

export class DespesaDto {
  @ApiProperty({ example: 12 }) id: number;
  @ApiProperty({ enum: TipoDespesa, example: TipoDespesa.PEDAGIO })
  tipo: TipoDespesa;
  @ApiProperty({ example: 8.9 }) valor: number;
  @ApiProperty({ example: '2026-10-21T13:40:00.000Z' }) incluidaEm: string;
  @ApiProperty({
    description: 'Valor final da corrida depois da despesa, se já finalizada.',
    nullable: true,
    example: 47.4,
  })
  valorFinalCorrida: number | null;
}
