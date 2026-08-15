import { BadRequestException } from '@nestjs/common';

export class CentroCustoInativoException extends BadRequestException {
  constructor(filialId: number, centroCustoId: number) {
    super(
      `O centro de custo ${centroCustoId} da filial ${filialId} está desativado`,
    );
  }
}
