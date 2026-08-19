import { ConflictException } from '@nestjs/common';

export class CorridaNaoPodeSerIniciadaException extends ConflictException {
  constructor() {
    super('Esta corrida ainda não pode ser iniciada ou já foi encerrada.');
  }
}
