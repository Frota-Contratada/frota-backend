import { DateTime } from 'luxon';

export class CentroCusto {
  constructor(
    public filialId: number,
    public id: number,
    public nome: string,
    public dataAtivacao: DateTime = DateTime.now(),
    public dataDesativacao?: DateTime,
  ) {}
}
