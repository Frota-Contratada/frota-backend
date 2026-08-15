import { BadRequestException } from '@nestjs/common';

export class ColaboradorSemFilialException extends BadRequestException {
  constructor(id: number) {
    super(
      `Colaborador ${id} não está vinculado a uma filial, então não pode receber um centro de custo`,
    );
  }
}
