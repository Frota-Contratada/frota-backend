import { HttpException, HttpStatus } from '@nestjs/common';

export class FalhaAoCarregarFotoPerfilException extends HttpException {
  constructor() {
    super(
      'Não foi possível carregar a foto de perfil do usuário.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
