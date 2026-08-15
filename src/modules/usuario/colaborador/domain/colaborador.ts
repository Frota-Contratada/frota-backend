import { DateTime } from 'luxon';
import { Usuario } from '@module/usuario/info/domain/usuario';
import { UsuarioPerfil } from '@module/usuario/info/domain/usuario-perfil';

export class Colaborador extends Usuario {
  constructor(
    nome: string,
    email: string,
    dataAtivacao: DateTime,
    id: number,
    public cargo?: string,
    public centroCustoId?: number,
    cpf?: string,
    dataDesativacao?: DateTime,
    perfis: UsuarioPerfil[] = [],
    filialId?: number,
    caminhoFotoPerfil?: string,
    fotoPerfil?: string,
  ) {
    super(
      nome,
      email,
      dataAtivacao,
      id,
      cpf,
      dataDesativacao,
      perfis,
      filialId,
      undefined,
      caminhoFotoPerfil,
      fotoPerfil,
    );
  }
}
