import { Injectable } from '@nestjs/common';
import { Motorista } from '../domain/motorista';
import { MotoristaRepositoryContract } from '../repositories/motorista-repository.contract';

@Injectable()
export class BuscarVariosMotoristasService {
  constructor(
    private readonly motoristaRepository: MotoristaRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cpf?: string;
  }): Promise<Motorista[]> {
    return this.motoristaRepository.buscarVarios({
      nome: filtros.nome,
      cpf: filtros.cpf,
    });
  }
}
