import { ForbiddenException } from '@nestjs/common';

export class UsuarioNaoAutenticadoException extends ForbiddenException {
  constructor() {
    super('Usuário não autenticado.');
  }
}
