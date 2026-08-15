import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Contrato } from '../domain/contrato';
import { ContratoBigNumbers } from '../domain/types/contrato-big-numbers.type';
import { ContratoSummary } from '../domain/types/contrato-summary.type';

export abstract class ContratoRepositoryContract {
  abstract criar(contrato: Contrato): Promise<Contrato>;
  abstract buscar(id: number): Promise<Contrato | null>;
  abstract buscarVarios(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ContratoSummary>>;
  abstract buscarBigNumbers(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Promise<ContratoBigNumbers>;
}
