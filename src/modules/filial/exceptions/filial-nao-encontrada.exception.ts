import { NotFoundException } from '@nestjs/common';

export class FilialNaoEncontradaException extends NotFoundException {
  constructor(id: number) {
    super(`Filial com id ${id} não encontrada`);
  }
}
