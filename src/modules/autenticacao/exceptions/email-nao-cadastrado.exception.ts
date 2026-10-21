import { NotFoundException } from '@nestjs/common';

export class EmailNaoCadastradoException extends NotFoundException {
  constructor() {
    super('Não encontramos uma conta com este e-mail.');
  }
}
