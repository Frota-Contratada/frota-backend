import { NotFoundException } from '@nestjs/common';

export class TipoCorridaNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Tipo de corrida com id ${id} não encontrado`);
  }
}
