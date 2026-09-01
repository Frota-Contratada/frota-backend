import { Injectable } from '@nestjs/common';
import { MotoristaCorrida } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';

@Injectable()
export class RecusarCorridaService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
  ) {}

  execute(
    corridaId: number,
    motoristaId: number,
    motivo: string,
  ): Promise<MotoristaCorrida> {
    return this.repository.recusar(corridaId, motoristaId, motivo);
  }
}
