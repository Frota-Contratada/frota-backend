import { DateTime } from 'luxon';
import { Usuario } from '@module/usuario/info/domain/usuario';

export class Motorista extends Usuario {
  constructor(
    nome: string,
    email: string,
    dataAtivacao: DateTime,
    id: number,
    public fornecedorId: number,
    cpf?: string,
    dataDesativacao?: DateTime,
  ) {
    super(nome, email, dataAtivacao, id, cpf, dataDesativacao);
  }
}
