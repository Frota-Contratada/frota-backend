import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { FornecedorSummary } from '../domain/types/fornecedor-summary.type';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';

@Injectable()
export class BuscarVariosFornecedoresService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cnpjCpf?: string;
    filialId?: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<FornecedorSummary>> {
    return this.fornecedorRepository.buscarVarios({
      nome: filtros.nome,
      cnpjCpf: filtros.cnpjCpf,
      filialId: filtros.filialId,
      page: filtros.page,
      limit: filtros.limit,
    });
  }
}
