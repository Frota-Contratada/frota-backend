import { Injectable } from '@nestjs/common';
import { Motorista } from '../domain/motorista';
import { MotoristaNaoEncontradoException } from '../exceptions/motorista-nao-encontrado.exception';
import {
  FiltrosMotorista,
  MotoristaRepositoryContract,
} from '../repositories/motorista-repository.contract';

@Injectable()
export class BuscarMotoristaService {
  constructor(
    private readonly motoristaRepository: MotoristaRepositoryContract,
  ) {}

  async executar(id: number): Promise<Motorista> {
    const motorista = await this.motoristaRepository.buscar(id);

    if (!motorista) {
      throw new MotoristaNaoEncontradoException(id);
    }

    return motorista;
  }

  async executarVarios(filtros: FiltrosMotorista): Promise<Motorista[]> {
    return this.motoristaRepository.buscarVarios(filtros);
  }
}
