import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingSnapshot } from '../domain/tracking.types';
import { TrackingService } from './tracking.service';

@Injectable()
export class BuscarTrackingService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
  ): Promise<TrackingSnapshot> {
    return this.trackingService.snapshot(corridaId, usuario);
  }
}
