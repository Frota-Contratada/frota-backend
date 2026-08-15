import { HttpException, HttpStatus } from '@nestjs/common';

export class FalhaAoRemoverFotoFornecedorException extends HttpException {
  constructor() {
    super(
      'Não foi possível remover a foto do fornecedor.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
