import { ForbiddenException } from '@nestjs/common';

export class TrackingAcessoNegadoException extends ForbiddenException {
  constructor() {
    super(
      'O usuário não tem permissão para acompanhar ou alterar esta corrida.',
    );
  }
}
