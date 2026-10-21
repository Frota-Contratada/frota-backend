import { ForbiddenException } from '@nestjs/common';

export class CorridaEmergencialNaoAutorizadaException extends ForbiddenException {
  constructor() {
    super('Seu perfil não permite solicitar corridas emergenciais.');
  }
}
