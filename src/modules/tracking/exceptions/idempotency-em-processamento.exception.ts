import { ConflictException } from '@nestjs/common';

export class IdempotencyEmProcessamentoException extends ConflictException {
  constructor() {
    super('Já existe um comando com esta chave em processamento.');
  }
}
