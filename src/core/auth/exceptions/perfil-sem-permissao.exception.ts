import { ForbiddenException } from '@nestjs/common';

export class PerfilSemPermissaoException extends ForbiddenException {
  constructor() {
    super('Usuário não possui perfil para acessar este recurso.');
  }
}
