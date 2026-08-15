import { CentroCusto } from '../domain/centro-custo';

export abstract class CentroCustoRepositoryContract {
  abstract buscar(
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null>;
  abstract existeAprovadorNoCentroCusto(
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean>;
}
