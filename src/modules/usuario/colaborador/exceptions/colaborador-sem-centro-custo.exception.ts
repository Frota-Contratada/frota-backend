import { BadRequestException } from '@nestjs/common';

export class ColaboradorSemCentroCustoException extends BadRequestException {
  constructor(id: number) {
    super(`Colaborador ${id} não possui centro de custo definido`);
  }
}
