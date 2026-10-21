import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ColaboradorSummary } from '../domain/types/colaborador-summary.type';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';

/**
 * Colaboradores da filial de quem solicita, para escolher o passageiro de uma
 * corrida pedida para outra pessoa. Sem fotos e sem filtro por CPF.
 */
@Injectable()
export class BuscarBeneficiariosService {
  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    empresaId: number;
    filialId: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ColaboradorSummary>> {
    return this.colaboradorRepository.buscarVarios(filtros);
  }
}
