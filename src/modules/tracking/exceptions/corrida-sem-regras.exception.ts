import { ConflictException } from '@nestjs/common';

export class CorridaSemRegrasException extends ConflictException {
  constructor() {
    super(
      'A corrida não possui regras de precificação para calcular o valor final.',
    );
  }
}
