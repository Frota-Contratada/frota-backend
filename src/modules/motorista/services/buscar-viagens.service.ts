import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { MotoristaCorrida } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';

@Injectable()
export class BuscarViagensService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
  ) {}

  execute(
    motoristaId: number,
    inicio: DateTime,
    fim: DateTime,
  ): Promise<MotoristaCorrida[]> {
    return this.repository.buscarViagens(motoristaId, inicio, fim);
  }
}
