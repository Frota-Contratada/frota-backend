import { AprovadorCentroCusto } from '../domain/aprovador-centro-custo';
import { CentroCusto } from '../domain/centro-custo';

export abstract class AprovadorCentroCustoRepositoryContract {
  abstract buscarCentroCusto(
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null>;
  abstract buscarPorUsuario(
    usuarioId: number,
  ): Promise<AprovadorCentroCusto | null>;
  abstract vincular(
    aprovador: AprovadorCentroCusto,
  ): Promise<AprovadorCentroCusto>;
}
