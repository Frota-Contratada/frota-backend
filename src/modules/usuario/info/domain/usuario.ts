import { DateTime } from 'luxon';

export class Usuario {
  id?: number;

  nome: string;
  email: string;
  cpf?: string;

  dataAtivacao: DateTime;
  dataDesativacao?: DateTime;
}
