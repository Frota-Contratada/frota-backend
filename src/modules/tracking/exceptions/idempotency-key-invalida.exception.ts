import { ConflictException } from '@nestjs/common';

export class IdempotencyKeyInvalidaException extends ConflictException {
  constructor(
    message = 'Idempotency-Key ausente ou inválida; informe um UUID.',
  ) {
    super(message);
  }
}
