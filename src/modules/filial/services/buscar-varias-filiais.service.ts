import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';
import { Filial } from '../domain/filial';

@Injectable()
export class BuscarVariasFiliaisService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async execute(filtros: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Filial>> {
    return this.filialRepository.buscarVarios({
      nome: filtros.nome,
      cnpj: filtros.cnpj,
      endereco: filtros.endereco,
      page: filtros.page,
      limit: filtros.limit,
    });
  }
}
