import { ForbiddenException } from '@nestjs/common';
import { TipoVinculo } from '../enums/tipo-vinculo.enum';

export class VinculoDoUsuarioAusenteException extends ForbiddenException {
  constructor(vinculo: TipoVinculo) {
    super(
      `Usuário não possui vínculo de ${vinculo} exigido pelo seu perfil de acesso.`,
    );
  }
}
