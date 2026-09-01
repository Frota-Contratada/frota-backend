import { Injectable } from '@nestjs/common';
import { MotoristaCorrida } from '../domain/motorista-corrida';
import { CorridaNaoEncontradaException } from '../exceptions/corrida-nao-encontrada.exception';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';

@Injectable()
export class BuscarCorridaService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
  ) {}

  async execute(
    corridaId: number,
    motoristaId: number,
  ): Promise<MotoristaCorrida> {
    const corrida = await this.repository.buscar(corridaId, motoristaId);
    if (!corrida) throw new CorridaNaoEncontradaException(corridaId);
    return corrida;
  }
}
