import { ConflictException } from '@nestjs/common';

export class CpfJaCadastradoException extends ConflictException {
  constructor(cpf: string) {
    super(`Usuário com CPF ${cpf} já cadastrado`);
  }
}
