import { ForbiddenException } from '@nestjs/common';

export class MotivoGlobalNaoGerenciavelException extends ForbiddenException {
  constructor(motivoId: number) {
    super(
      `O motivo ${motivoId} é global e só pode ser alterado por um admin master`,
    );
  }
}
