import { ConflictException } from '@nestjs/common';

export class CorridaNaoPodeSerCanceladaException extends ConflictException {
  constructor() {
    super('A corrida não pode mais ser cancelada.');
  }
}
