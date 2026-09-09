import { ApiProperty } from '@nestjs/swagger';

export class EsperaDto {
  @ApiProperty() active: boolean;
  @ApiProperty({ nullable: true }) startedAt: string | null;
}
