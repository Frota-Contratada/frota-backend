import { NotFoundException } from '@nestjs/common';

export class AprovadorNaoEncontradoException extends NotFoundException {
  constructor(usuarioId: number) {
    super(`Usuário com id ${usuarioId} não encontrado`);
  }
}
