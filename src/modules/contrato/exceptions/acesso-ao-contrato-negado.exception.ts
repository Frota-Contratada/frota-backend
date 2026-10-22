import { ForbiddenException } from '@nestjs/common';

export class AcessoAoContratoNegadoException extends ForbiddenException {
  constructor(id: number) {
    super(
      `O usuário autenticado não tem acesso ao contrato com id ${id}: ele não está vinculado à sua filial ou ao seu fornecedor.`,
    );
  }
}
