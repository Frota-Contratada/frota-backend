import { BadRequestException } from '@nestjs/common';

export class AcompanhanteDuplicadoException extends BadRequestException {
  constructor(cpf: string) {
    super(`O CPF ${cpf} foi informado mais de uma vez entre os passageiros`);
  }
}
