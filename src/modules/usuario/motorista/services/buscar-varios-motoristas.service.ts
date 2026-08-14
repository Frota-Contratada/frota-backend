import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
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
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Motorista>> {
    return this.motoristaRepository.buscarVarios({
      nome: filtros.nome,
      cpf: filtros.cpf,
      page: filtros.page,
      limit: filtros.limit,
    });
  }
}
