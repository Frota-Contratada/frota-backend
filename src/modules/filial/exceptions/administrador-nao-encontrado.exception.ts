import { NotFoundException } from '@nestjs/common';

export class AdministradorNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Administrador com id ${id} não encontrado`);
  }
}
