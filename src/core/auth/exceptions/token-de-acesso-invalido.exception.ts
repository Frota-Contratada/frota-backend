import { UnauthorizedException } from '@nestjs/common';

export class TokenDeAcessoInvalidoException extends UnauthorizedException {
  constructor() {
    super('Token de acesso inválido.');
  }
}
