import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class PinInvalidoException extends BadRequestException {
  constructor() {
    super('Pin incorreto.');
  }
}
