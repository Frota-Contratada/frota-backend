import { ForbiddenException } from '@nestjs/common';

export class FornecedorDeOutraFilialException extends ForbiddenException {
  constructor(fornecedorId: number, filialId: number) {
    super(`O fornecedor ${fornecedorId} não pertence à filial ${filialId}`);
  }
}
