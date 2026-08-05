import { NotFoundException } from '@nestjs/common';

export class CentroCustoNaoEncontradoException extends NotFoundException {
  constructor(filialId: number, centroCustoId: number) {
    super(
      `Centro de custo ${centroCustoId} da filial ${filialId} não encontrado`,
    );
  }
}
