import { ApiProperty } from '@nestjs/swagger';
import { TrackingPositionDto } from './tracking-position.dto';

export class PosicaoAceitaDto {
  @ApiProperty({ type: TrackingPositionDto, nullable: true })
  accepted: TrackingPositionDto | null;
}
