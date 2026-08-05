import { ConflictException } from '@nestjs/common';

export class FilialCnpjJaCadastradoException extends ConflictException {
  constructor(cnpj: string) {
    super(`Filial com CNPJ ${cnpj} já cadastrada`);
  }
}
