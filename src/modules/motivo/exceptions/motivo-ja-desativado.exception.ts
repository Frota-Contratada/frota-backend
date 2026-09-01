import { ConflictException } from '@nestjs/common';

export class MotivoJaDesativadoException extends ConflictException {
  constructor(id: number) {
    super(`O motivo ${id} já está desativado`);
  }
}
