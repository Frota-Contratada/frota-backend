import { ConflictException } from '@nestjs/common';

export class CorridaNaoPodeSerRecusadaException extends ConflictException {
  constructor() {
    super('Esta corrida não pode mais ser recusada.');
  }
}
