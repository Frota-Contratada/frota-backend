import { ConflictException } from '@nestjs/common';

export class CorridaSemPosicoesException extends ConflictException {
  constructor() {
    super(
      'A corrida não possui posições válidas suficientes para ser finalizada.',
    );
  }
}
