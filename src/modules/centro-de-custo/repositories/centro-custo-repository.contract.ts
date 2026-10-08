import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { CentroCusto } from '../domain/centro-custo';

export abstract class CentroCustoRepositoryContract {
  abstract buscar(
    empresaId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null>;
  abstract buscarVarios(filtros: {
    empresaId?: number;
    filialId?: number;
    nome?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<CentroCusto>>;
  abstract buscarPorFilial(
    empresaId: number,
    filialId: number,
  ): Promise<CentroCusto[]>;
  abstract buscarIdsComAprovador(
    empresaId: number,
    filialId: number,
  ): Promise<number[]>;
  abstract existeAprovadorNoCentroCusto(
    empresaId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean>;

  abstract buscarAprovadorId(
    empresaId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<number | null>;
}
