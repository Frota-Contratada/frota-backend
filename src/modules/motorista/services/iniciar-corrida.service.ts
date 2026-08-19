import { Injectable } from '@nestjs/common';
import { MotoristaCorrida } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';

@Injectable()
export class IniciarCorridaService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
  ) {}

  execute(corridaId: number, motoristaId: number): Promise<MotoristaCorrida> {
    return this.repository.iniciar(corridaId, motoristaId);
  }
}
