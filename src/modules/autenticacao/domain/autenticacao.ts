import { Usuario } from '@module/usuario/info/domain/usuario';
import { UsuarioPerfil } from '@module/usuario/info/domain/usuario-perfil';

export class Autenticacao {
  constructor(
    public usuario: Usuario,
    public senha?: string,
    public perfis?: UsuarioPerfil[],
  ) {}
}
