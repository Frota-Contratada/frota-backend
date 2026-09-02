import { ApiProperty } from '@nestjs/swagger';

export class ParadaConcluidaDto {
  @ApiProperty() sequence: number;
  @ApiProperty() completedAt: string;
}
