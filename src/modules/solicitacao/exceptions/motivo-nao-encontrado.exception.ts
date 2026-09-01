import { NotFoundException } from '@nestjs/common';

export class MotivoNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Motivo com id ${id} não encontrado`);
  }
}
