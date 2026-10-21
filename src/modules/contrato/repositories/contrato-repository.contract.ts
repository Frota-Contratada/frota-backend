import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Contrato } from '../domain/contrato';
import { Regra } from '../domain/regra';
import { ContratoBigNumbers } from '../domain/types/contrato-big-numbers.type';
import { ContratoSummary } from '../domain/types/contrato-summary.type';
import { VinculoContrato } from '../domain/vinculo-contrato';

export abstract class ContratoRepositoryContract {
  abstract criar(
    contrato: Contrato,
    vinculo: VinculoContrato,
    tipoCorridaIds: number[],
  ): Promise<Contrato>;
  abstract buscar(id: number): Promise<Contrato | null>;
  abstract buscarVinculos(id: number): Promise<VinculoContrato[]>;
  abstract publicar(id: number): Promise<Contrato>;
  abstract substituirRegras(contratoId: number, regras: Regra[]): Promise<void>;
  abstract buscarVarios(filtros: {
    filialId?: number;
    empresaId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ContratoSummary>>;
  abstract buscarBigNumbers(filtros: {
    filialId?: number;
    empresaId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Promise<ContratoBigNumbers>;
}
