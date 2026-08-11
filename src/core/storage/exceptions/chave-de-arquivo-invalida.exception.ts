import { BadRequestException } from '@nestjs/common';

export class ChaveDeArquivoInvalidaException extends BadRequestException {
  constructor(chave: string) {
    super(`Chave de arquivo inválida: ${chave}`);
  }
}
