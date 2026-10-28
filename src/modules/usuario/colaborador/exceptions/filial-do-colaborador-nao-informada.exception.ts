import { BadRequestException } from '@nestjs/common';

export class FilialDoColaboradorNaoInformadaException extends BadRequestException {
  constructor() {
    super('Informe a empresa e a filial do colaborador');
  }
}
