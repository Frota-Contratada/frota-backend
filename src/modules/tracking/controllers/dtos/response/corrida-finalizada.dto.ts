import { ApiProperty } from '@nestjs/swagger';

export class CorridaFinalizadaDto {
  @ApiProperty({ enum: ['finished'] }) tripStatus: 'finished';
  @ApiProperty() finishedAt: string;
  @ApiProperty() quilometragem: number;
  @ApiProperty() valorFinal: number;
}
