import { NotFoundException } from '@nestjs/common';

export class TipoVeiculoNaoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Tipo de veículo com id ${id} não encontrado`);
  }
}
