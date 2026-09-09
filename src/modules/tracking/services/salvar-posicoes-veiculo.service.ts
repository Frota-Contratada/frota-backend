import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingPosition } from '../domain/tracking.types';
import { TrackingService } from './tracking.service';

@Injectable()
export class SalvarPosicoesVeiculoService {
  constructor(private readonly trackingService: TrackingService) {}

  execute(
    corridaId: number,
    usuario: AuthenticatedUser,
    posicoes: TrackingPosition[],
  ): Promise<TrackingPosition | null> {
    return this.trackingService.saveVehiclePositions(
      corridaId,
      usuario,
      posicoes,
    );
  }
}
