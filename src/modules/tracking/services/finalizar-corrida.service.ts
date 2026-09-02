import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingService } from './tracking.service';

@Injectable()
export class FinalizarCorridaService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
    chaveIdempotencia: string,
  ): Promise<{ tripStatus: 'finished'; finishedAt: string }> {
    return this.trackingService.finish(corridaId, usuario, chaveIdempotencia);
  }
}
