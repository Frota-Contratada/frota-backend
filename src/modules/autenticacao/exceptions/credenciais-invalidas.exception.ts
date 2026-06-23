import { UnauthorizedException } from '@nestjs/common';

export class CredenciaisInvalidasException extends UnauthorizedException {
  constructor() {
    super('Credenciais incorretas.');
  }
}
