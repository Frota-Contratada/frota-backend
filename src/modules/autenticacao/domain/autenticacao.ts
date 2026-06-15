import { Usuario } from '../../usuario/info/domain/usuario';
import { Perfil } from './perfil';

export class Autenticacao {
  senha: string;

  usuario: Usuario;
  perfis: Perfil[];
}
