import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { CanonicalRoute, TrackingPosition } from '../domain/tracking.types';
import { TrackingService } from './tracking.service';

@Injectable()
export class RecalcularRotaService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
    chaveIdempotencia: string,
    posicao: TrackingPosition,
  ): Promise<CanonicalRoute> {
    return this.trackingService.reroute(
      corridaId,
      usuario,
      chaveIdempotencia,
      posicao,
    );
  }
}
