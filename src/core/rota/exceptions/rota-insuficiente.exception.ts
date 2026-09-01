import { BadRequestException } from '@nestjs/common';

export class RotaInsuficienteException extends BadRequestException {
  constructor() {
    super('Informe ao menos dois pontos para calcular o trajeto');
  }
}
