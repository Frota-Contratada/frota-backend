import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { CentroCusto } from '../domain/centro-custo';

export abstract class CentroCustoRepositoryContract {
  abstract buscar(
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null>;
  abstract buscarVarios(filtros: {
    filialId?: number;
    nome?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<CentroCusto>>;
  abstract existeAprovadorNoCentroCusto(
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean>;
}
