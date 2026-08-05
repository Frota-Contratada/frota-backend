import { ConflictException } from '@nestjs/common';

export class FilialNomeJaCadastradoException extends ConflictException {
  constructor(nome: string) {
    super(`Filial com nome ${nome} já cadastrada`);
  }
}
