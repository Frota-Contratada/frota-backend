import { NotFoundException } from '@nestjs/common';

export class SolicitanteNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Solicitante com id ${id} não encontrado`);
  }
}
