import { DateTime } from 'luxon';

export class AprovadorCentroCusto {
  constructor(
    public usuarioId: number,
    public filialId: number,
    public centroCustoId: number,
    public dataVinculo: DateTime = DateTime.now(),
  ) {}
}
