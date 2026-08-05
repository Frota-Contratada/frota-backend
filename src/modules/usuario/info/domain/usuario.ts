import { DateTime } from 'luxon';
import { UsuarioPerfil } from './usuario-perfil';

export class Usuario {
  constructor(
    public nome: string,
    public email: string,
    public dataAtivacao: DateTime,
    public id: number,
    public cpf?: string,
    public dataDesativacao?: DateTime,
    public perfis: UsuarioPerfil[] = [],
    public filialId?: number,
  ) {}
}
