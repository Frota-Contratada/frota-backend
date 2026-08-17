import { CentroCusto } from '../domain/centro-custo';

export abstract class CentroCustoRepositoryContract {
  abstract buscar(
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null>;
  abstract buscarPorFilial(filialId: number): Promise<CentroCusto[]>;
  abstract buscarIdsComAprovador(filialId: number): Promise<number[]>;
  abstract existeAprovadorNoCentroCusto(
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean>;

  abstract buscarAprovadorId(
    filialId: number,
    centroCustoId: number,
  ): Promise<number | null>;
}
