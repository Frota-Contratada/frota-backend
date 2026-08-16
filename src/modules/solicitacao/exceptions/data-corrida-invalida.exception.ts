import { BadRequestException } from '@nestjs/common';

export class DataCorridaInvalidaException extends BadRequestException {
  constructor() {
    super('A data e o horário da corrida devem estar no futuro');
  }
}
