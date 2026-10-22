import { ConflictException } from '@nestjs/common';

export class ContratoNaoPublicavelException extends ConflictException {
  constructor(id: number, motivo: string) {
    super(`Contrato com id ${id} não pode ser publicado: ${motivo}.`);
  }
}
