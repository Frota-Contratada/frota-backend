import { ForbiddenException } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export class UsuarioNaoPertenceAFilialException extends ForbiddenException {
  constructor(usuarioId: number, filialId: number, tipoPerfil: TipoPerfil) {
    super(
      `Usuário ${usuarioId} não possui o perfil ${tipoPerfil} vigente na filial ${filialId}`,
    );
  }
}
