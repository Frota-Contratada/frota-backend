import { NotFoundException } from '@nestjs/common';

export class ContratoNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Contrato com id ${id} não encontrado.`);
  }
}
