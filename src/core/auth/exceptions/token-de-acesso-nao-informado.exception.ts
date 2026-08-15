import { UnauthorizedException } from '@nestjs/common';

export class TokenDeAcessoNaoInformadoException extends UnauthorizedException {
  constructor() {
    super('Token de acesso não informado.');
  }
}
