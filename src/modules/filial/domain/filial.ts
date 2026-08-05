import { DateTime } from 'luxon';
import { Endereco } from './endereco';

export class Filial {
  constructor(
    public nome: string,
    public cnpj: string,
    public endereco: Endereco,
    public id: number = 0,
    public dataAtivacao: DateTime = DateTime.now(),
    public dataDesativacao?: DateTime,
  ) {}
}
