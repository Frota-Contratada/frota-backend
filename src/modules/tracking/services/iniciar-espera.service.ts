import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingService } from './tracking.service';

@Injectable()
export class IniciarEsperaService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
    chaveIdempotencia: string,
  ): Promise<{ active: boolean; startedAt: string | null }> {
    return this.trackingService.startWaiting(
      corridaId,
      usuario,
      chaveIdempotencia,
    );
  }
}
