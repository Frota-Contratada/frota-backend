import { ConflictException } from '@nestjs/common';

export class CnpjCpfJaCadastradoException extends ConflictException {
  constructor(cnpjCpf: string) {
    super(`Fornecedor com CNPJ/CPF ${cnpjCpf} já cadastrado`);
  }
}
