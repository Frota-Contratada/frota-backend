import { NotFoundException } from '@nestjs/common';

export class TrackingCorridaNaoEncontradaException extends NotFoundException {
  constructor(id: number) {
    super(`Corrida com id ${id} não encontrada.`);
  }
}
