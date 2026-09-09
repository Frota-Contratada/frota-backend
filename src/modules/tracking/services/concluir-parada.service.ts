import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingService } from './tracking.service';

@Injectable()
export class ConcluirParadaService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    sequencia: number,
    usuario: AuthenticatedUser,
    chaveIdempotencia: string,
  ): Promise<{ sequence: number; completedAt: string }> {
    return this.trackingService.completeStop(
      corridaId,
      sequencia,
      usuario,
      chaveIdempotencia,
    );
  }
}
