import { Injectable } from '@nestjs/common';
import { MotoristaCorrida } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';
import { TrackingService } from '@module/tracking/services/tracking.service';

@Injectable()
export class IniciarCorridaService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(
    corridaId: number,
    motoristaId: number,
  ): Promise<MotoristaCorrida> {
    await this.trackingService.assegurarRotaInicial(corridaId, motoristaId);
    const corrida = await this.repository.iniciar(corridaId, motoristaId);
    this.trackingService.publishStarted(corridaId);
    return corrida;
  }
}
