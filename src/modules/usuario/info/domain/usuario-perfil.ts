import { DateTime } from 'luxon';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export class UsuarioPerfil {
  constructor(
    public usuarioId: number,
    public tipoPerfil: TipoPerfil,
    public dataInicioVigencia: DateTime,
    public dataFimVigencia?: DateTime,
  ) {}
}
