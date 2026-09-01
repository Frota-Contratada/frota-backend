import { DateTime } from 'luxon';
import { StatusCorrida } from '../enums/status-corrida.enum';

export class CorridaSolicitacao {
  constructor(
    public id: number,
    public status: StatusCorrida,
    public dataInicio: DateTime,
    public motoristaId: number,
    public kmPercorrido: number,
    public valorFinal: number,
    public placaVeiculo: string,
    public motoristaNome?: string,
    public dataFim?: DateTime,
  ) {}

  get emAndamento(): boolean {
    return this.status === StatusCorrida.INICIADA && this.dataFim == null;
  }
}
