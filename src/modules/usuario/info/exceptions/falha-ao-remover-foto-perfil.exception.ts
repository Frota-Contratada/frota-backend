import { HttpException, HttpStatus } from '@nestjs/common';

export class FalhaAoRemoverFotoPerfilException extends HttpException {
  constructor() {
    super(
      'Não foi possível remover a foto de perfil.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
