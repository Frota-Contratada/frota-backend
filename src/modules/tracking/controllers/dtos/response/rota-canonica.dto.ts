import { ApiProperty } from '@nestjs/swagger';
import type { CanonicalRoute } from '../../../domain/tracking.types';

export class RotaCanonicaDto implements CanonicalRoute {
  @ApiProperty() routeId: string;
  @ApiProperty() version: number;
  @ApiProperty() calculatedAt: string;
  @ApiProperty() origin: CanonicalRoute['origin'];
  @ApiProperty() stops: CanonicalRoute['stops'];
  @ApiProperty() destination: CanonicalRoute['destination'];
  @ApiProperty() coordinates: CanonicalRoute['coordinates'];
  @ApiProperty() distanceMeters: number;
  @ApiProperty() durationSeconds: number;
  @ApiProperty() trafficDelaySeconds: number;
  @ApiProperty() trafficSections: CanonicalRoute['trafficSections'];
  @ApiProperty() instructions: CanonicalRoute['instructions'];
}
