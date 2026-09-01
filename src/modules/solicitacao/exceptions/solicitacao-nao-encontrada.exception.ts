import { NotFoundException } from '@nestjs/common';

export class SolicitacaoNaoEncontradaException extends NotFoundException {
  constructor(id: number) {
    super(`Solicitação com id ${id} não encontrada`);
  }
}
