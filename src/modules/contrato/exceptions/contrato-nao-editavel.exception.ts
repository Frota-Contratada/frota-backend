import { ConflictException } from '@nestjs/common';

export class ContratoNaoEditavelException extends ConflictException {
  constructor(id: number) {
    super(`Contrato com id ${id} não está em rascunho e não pode ser editado.`);
  }
}
