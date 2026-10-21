import { Injectable } from '@nestjs/common';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoContrato } from '../enums/ordenacao-contrato.enum';
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
    empresaId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
    ordenarPor?: CampoOrdenacaoContrato;
    direcao?: DirecaoOrdenacao;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ContratoSummary>> {
    return this.contratoRepository.buscarVarios(filtros);
  }
}
