import { Injectable } from '@nestjs/common';
import { Motorista } from '../domain/motorista';
import { MotoristaNaoEncontradoException } from '../exceptions/motorista-nao-encontrado.exception';
import { MotoristaRepositoryContract } from '../repositories/motorista-repository.contract';

@Injectable()
export class BuscarMotoristaService {
  constructor(
    private readonly motoristaRepository: MotoristaRepositoryContract,
  ) {}

  async execute(id: number): Promise<Motorista> {
    const motorista = await this.motoristaRepository.buscar(id);

    if (!motorista) {
      throw new MotoristaNaoEncontradoException(id);
    }

    return motorista;
  }
}
