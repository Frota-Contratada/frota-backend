import { ApiProperty } from '@nestjs/swagger';
import type {
  CanonicalRoute,
  TrackingSnapshot,
} from '../../../domain/tracking.types';
import { RotaCanonicaDto } from './rota-canonica.dto';

export class SnapshotTrackingDto implements TrackingSnapshot {
  @ApiProperty() tripStatus: TrackingSnapshot['tripStatus'];
  @ApiProperty() waiting: TrackingSnapshot['waiting'];
  @ApiProperty({ type: RotaCanonicaDto }) route: CanonicalRoute;
  @ApiProperty() vehiclePosition: TrackingSnapshot['vehiclePosition'];
  @ApiProperty() passengerPosition: TrackingSnapshot['passengerPosition'];
  @ApiProperty() driver: TrackingSnapshot['driver'];
  @ApiProperty() vehicle: TrackingSnapshot['vehicle'];
  @ApiProperty() startedAt: string;
  @ApiProperty() updatedAt: string;
}
