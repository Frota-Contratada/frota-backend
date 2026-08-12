import { HttpException, HttpStatus } from '@nestjs/common';

export class FalhaAoRemoverArquivoContratoException extends HttpException {
  constructor() {
    super(
      'Não foi possível remover o arquivo do contrato.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
