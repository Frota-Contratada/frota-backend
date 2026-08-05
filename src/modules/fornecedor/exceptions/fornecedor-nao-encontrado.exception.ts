import { NotFoundException } from '@nestjs/common';

export class FornecedorNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Fornecedor com id ${id} não encontrado`);
  }
}
