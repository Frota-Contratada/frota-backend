import { DateTime } from 'luxon';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { UsuarioPerfil } from '../../../domain/usuario-perfil';

export class UsuarioPerfilDto {
  tipoPerfil: TipoPerfil;
  dataInicioVigencia: DateTime;
  dataFimVigencia?: DateTime;

  constructor(perfil: UsuarioPerfil) {
    this.tipoPerfil = perfil.tipoPerfil;
    this.dataInicioVigencia = perfil.dataInicioVigencia;
    this.dataFimVigencia = perfil.dataFimVigencia;
  }
}
