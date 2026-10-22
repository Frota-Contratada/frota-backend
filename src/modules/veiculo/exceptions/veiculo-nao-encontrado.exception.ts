import { NotFoundException } from '@nestjs/common';

export class VeiculoNaoEncontradoException extends NotFoundException {
  constructor(id: number, fornecedorId?: number) {
    super(
      fornecedorId == null
        ? `Veículo com id ${id} não encontrado`
        : `Veículo com id ${id} não encontrado no fornecedor ${fornecedorId}`,
    );
  }
}
