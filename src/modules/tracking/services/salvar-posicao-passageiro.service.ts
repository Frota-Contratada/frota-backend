import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingPosition } from '../domain/tracking.types';
import { TrackingService } from './tracking.service';

@Injectable()
export class SalvarPosicaoPassageiroService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
    posicao: TrackingPosition,
  ): Promise<TrackingPosition | null> {
    return this.trackingService.savePassengerPosition(
      corridaId,
      usuario,
      posicao,
    );
  }
}
