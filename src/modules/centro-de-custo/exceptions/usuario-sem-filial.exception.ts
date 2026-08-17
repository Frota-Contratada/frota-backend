import { BadRequestException } from '@nestjs/common';

export class UsuarioSemFilialException extends BadRequestException {
  constructor(usuarioId: number) {
    super(
      `Usuário ${usuarioId} não está vinculado a uma filial, então não possui centros de custo`,
    );
  }
}
