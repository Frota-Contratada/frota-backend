import { DateTime } from 'luxon';
import { Usuario } from '../../../domain/usuario';
import { UsuarioPerfilDto } from './usuario-perfil.dto';

export class UsuarioAtualDto {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  dataAtivacao: DateTime;
  dataDesativacao?: DateTime;
  fotoPerfil?: string;
  perfis: UsuarioPerfilDto[];

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.cpf = usuario.cpf;
    this.dataAtivacao = usuario.dataAtivacao;
    this.dataDesativacao = usuario.dataDesativacao;
    this.fotoPerfil = usuario.fotoPerfil;
    this.perfis = usuario.perfis.map((perfil) => new UsuarioPerfilDto(perfil));
  }
}
