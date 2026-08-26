import { ApiProperty } from '@nestjs/swagger';
import type {
  CanonicalRoute,
  TrackingSnapshot,
} from '../../domain/tracking.types';

export class CanonicalRouteDto {
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

export class TrackingSnapshotDto implements TrackingSnapshot {
  @ApiProperty() tripStatus: TrackingSnapshot['tripStatus'];
  @ApiProperty() waiting: TrackingSnapshot['waiting'];
  @ApiProperty({ type: CanonicalRouteDto }) route: CanonicalRoute;
  @ApiProperty() vehiclePosition: TrackingSnapshot['vehiclePosition'];
  @ApiProperty() passengerPosition: TrackingSnapshot['passengerPosition'];
  @ApiProperty() driver: TrackingSnapshot['driver'];
  @ApiProperty() vehicle: TrackingSnapshot['vehicle'];
  @ApiProperty() startedAt: string;
  @ApiProperty() updatedAt: string;
}

export class WaitingDto {
  @ApiProperty() active: boolean;
  @ApiProperty({ nullable: true }) startedAt: string | null;
}
