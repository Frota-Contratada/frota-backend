import { Usuario } from '@module/usuario/info/domain/usuario';
import { Perfil } from './perfil';

export class Autenticacao {
  constructor(
    public usuario: Usuario,
    public senha?: string,
    public perfis?: Perfil[],
  ) {}
}
