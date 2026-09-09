import { NotFoundException } from '@nestjs/common';

export class ParadaTrackingNaoEncontradaException extends NotFoundException {
  constructor(sequence: number) {
    super(`Parada de sequência ${sequence} não encontrada nesta corrida.`);
  }
}
