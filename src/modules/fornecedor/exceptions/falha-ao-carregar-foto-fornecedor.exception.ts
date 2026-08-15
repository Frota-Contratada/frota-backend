import { HttpException, HttpStatus } from '@nestjs/common';

export class FalhaAoCarregarFotoFornecedorException extends HttpException {
  constructor() {
    super(
      'Não foi possível carregar a foto do fornecedor.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
