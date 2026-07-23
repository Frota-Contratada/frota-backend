import { DateTime } from 'luxon';
import { Permissao } from './permissao';

export class Perfil {
  id: number;
  nome: string;

  dataAtivacao: DateTime;
  dataDesativacao?: DateTime;

  permissoes: Permissao[];
}
