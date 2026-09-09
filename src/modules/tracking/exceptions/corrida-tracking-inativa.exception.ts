import { ConflictException } from '@nestjs/common';

export class CorridaTrackingInativaException extends ConflictException {
  constructor() {
    super('A corrida precisa estar em andamento para executar este comando.');
  }
}
