import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ContratoSummary } from '../domain/types/contrato-summary.type';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

@Injectable()
export class BuscarVariosContratosService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
  ) {}

  async execute(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ContratoSummary>> {
    return this.contratoRepository.buscarVarios(filtros);
  }
}
