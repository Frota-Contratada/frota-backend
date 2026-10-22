import { ForbiddenException } from '@nestjs/common';

export class AcessoAoFornecedorNegadoException extends ForbiddenException {
  constructor(fornecedorId: number) {
    super(
      `O usuário autenticado não pode acessar a frota do fornecedor ${fornecedorId}`,
    );
  }
}
