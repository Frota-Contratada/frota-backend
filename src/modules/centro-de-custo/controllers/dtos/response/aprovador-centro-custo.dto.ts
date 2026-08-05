export class AprovadorCentroCustoDto {
  usuarioId: number;
  filialId: number;
  centroCustoId: number;
  dataVinculo: string;

  constructor(
    usuarioId: number,
    filialId: number,
    centroCustoId: number,
    dataVinculo: string,
  ) {
    this.usuarioId = usuarioId;
    this.filialId = filialId;
    this.centroCustoId = centroCustoId;
    this.dataVinculo = dataVinculo;
  }
}
