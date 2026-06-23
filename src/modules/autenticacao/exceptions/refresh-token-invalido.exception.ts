import { UnauthorizedException } from '@nestjs/common';

export class RefreshTokenInvalidoException extends UnauthorizedException {
  constructor() {
    super('Refresh token inválido.');
  }
}
