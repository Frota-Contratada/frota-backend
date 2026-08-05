import { ConflictException } from '@nestjs/common';

export class FornecedorJaCadastradoException extends ConflictException {
  constructor(nome: string) {
    super(`Fornecedor com nome ${nome} já cadastrado nesta filial`);
  }
}
