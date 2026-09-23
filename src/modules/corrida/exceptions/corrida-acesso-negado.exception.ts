import { ForbiddenException } from '@nestjs/common';

export class CorridaAcessoNegadoException extends ForbiddenException {
  constructor() {
    super('Você não tem acesso a esta corrida.');
  }
}
