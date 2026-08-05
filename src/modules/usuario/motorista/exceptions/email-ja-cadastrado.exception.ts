import { ConflictException } from '@nestjs/common';

export class EmailJaCadastradoException extends ConflictException {
  constructor(email: string) {
    super(`Usuário com e-mail ${email} já cadastrado`);
  }
}
