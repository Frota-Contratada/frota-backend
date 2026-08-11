import { NotFoundException } from '@nestjs/common';

export class ArquivoNaoEncontradoException extends NotFoundException {
  constructor(chave: string) {
    super(`Arquivo ${chave} não encontrado`);
  }
}
