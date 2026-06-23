import { DateTime } from 'luxon';

export class Usuario {
  constructor(
    public nome: string,
    public email: string,
    public dataAtivacao: DateTime,
    public id: number,
    public cpf?: string,
    public dataDesativacao?: DateTime,
  ) {}
}
