import { DateTime } from 'luxon';
import { UsuarioPerfilDto } from './usuario-perfil.dto';
import { Usuario } from '@module/usuario/info/domain/usuario';

export class UsuarioAtualDto {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  dataAtivacao: DateTime;
  dataDesativacao?: DateTime;
  perfis: UsuarioPerfilDto[];

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.cpf = usuario.cpf;
    this.dataAtivacao = usuario.dataAtivacao;
    this.dataDesativacao = usuario.dataDesativacao;
    this.perfis = usuario.perfis.map(
      (perfil) => new UsuarioPerfilDto(perfil),
    );
  }
}
