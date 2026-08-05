import { NotFoundException } from '@nestjs/common';

export class MotoristaNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Motorista com id ${id} não encontrado`);
  }
}
