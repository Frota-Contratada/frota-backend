import { ForbiddenException } from '@nestjs/common';

export class MotivoDeOutraFilialException extends ForbiddenException {
  constructor(motivoId: number, filialId: number) {
    super(`O motivo ${motivoId} não pertence à filial ${filialId}`);
  }
}
