import { NotFoundException } from '@nestjs/common';

export class CorridaNaoEncontradaException extends NotFoundException {
  constructor(id: number) {
    super(`Corrida com id ${id} não encontrada.`);
  }
}
