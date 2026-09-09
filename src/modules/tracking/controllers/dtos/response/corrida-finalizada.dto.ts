import { ApiProperty } from '@nestjs/swagger';

export class CorridaFinalizadaDto {
  @ApiProperty({ enum: ['finished'] }) tripStatus: 'finished';
  @ApiProperty() finishedAt: string;
}
