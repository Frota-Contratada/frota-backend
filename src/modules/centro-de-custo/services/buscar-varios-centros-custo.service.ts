import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { CentroCustoRepositoryContract } from '../repositories/centro-custo-repository.contract';
import { CentroCusto } from '../domain/centro-custo';

@Injectable()
export class BuscarVariosCentrosCustoService {
  constructor(
    private readonly centroCustoRepository: CentroCustoRepositoryContract,
  ) {}

  async execute(filtros: {
    filialId?: number;
    nome?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<CentroCusto>> {
    return this.centroCustoRepository.buscarVarios({
      filialId: filtros.filialId,
      nome: filtros.nome,
      page: filtros.page,
      limit: filtros.limit,
    });
  }
}
