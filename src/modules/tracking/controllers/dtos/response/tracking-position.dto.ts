import { ApiProperty } from '@nestjs/swagger';
import { TrackingPosition } from '../../../domain/tracking.types';

export class TrackingPositionDto implements TrackingPosition {
  @ApiProperty() lat: number;
  @ApiProperty() lng: number;
  @ApiProperty() accuracy: number;
  @ApiProperty() speed: number;
  @ApiProperty() heading: number;
  @ApiProperty() timestamp: string;
}
