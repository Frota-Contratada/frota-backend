import { ForbiddenException } from '@nestjs/common';

export class ColaboradorDeOutraFilialException extends ForbiddenException {
  constructor(id: number) {
    super(`Colaborador ${id} não pertence à sua filial`);
  }
}
