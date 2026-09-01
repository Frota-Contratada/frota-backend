import { BadRequestException } from '@nestjs/common';

export class CentroCustoDuplicadoException extends BadRequestException {
  constructor(centroCustoId: number) {
    super(`O centro de custo ${centroCustoId} foi informado mais de uma vez`);
  }
}
