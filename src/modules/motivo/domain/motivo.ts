import { DateTime } from 'luxon';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export class Motivo {
  constructor(
    public id: number,
    public nome: string,
    public tipo: TipoMotivo,
    public dataAtivacao: DateTime = DateTime.now(),
    /** `undefined` indica motivo global, disponível para todas as filiais. */
    public filialId?: number,
    public dataDesativacao?: DateTime,
  ) {}

  get global(): boolean {
    return this.filialId === undefined;
  }

  get ativo(): boolean {
    return this.dataDesativacao === undefined;
  }
}
