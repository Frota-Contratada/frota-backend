import { NotFoundException } from '@nestjs/common';

export class ColaboradorNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Colaborador com id ${id} não encontrado`);
  }
}
