import { NotFoundException, NotImplementedException } from '@nestjs/common';

export class EmailNaoEncontradoException extends NotFoundException {
  constructor(email: string) {
    super(`Usuário com ${email} não encontrado`);
  }
}
