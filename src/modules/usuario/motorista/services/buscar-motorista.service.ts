import { Injectable } from '@nestjs/common';
import { Motorista } from '../domain/motorista';
import { MotoristaNaoEncontradoException } from '../exceptions/motorista-nao-encontrado.exception';
import { MotoristaRepositoryContract } from '../repositories/motorista-repository.contract';

@Injectable()
export class BuscarMotoristaService {
  constructor(
    private readonly motoristaRepository: MotoristaRepositoryContract,
  ) {}

  async execute(id: number, fornecedorId?: number): Promise<Motorista> {
    const motorista = await this.motoristaRepository.buscar(id);

    // Fora do escopo do fornecedor responde como inexistente, sem revelar o ID.
    if (
      !motorista ||
      (fornecedorId != null && motorista.fornecedorId !== fornecedorId)
    ) {
      throw new MotoristaNaoEncontradoException(id);
    }

    return motorista;
  }
}
