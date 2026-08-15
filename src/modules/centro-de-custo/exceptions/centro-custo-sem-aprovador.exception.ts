import { BadRequestException } from '@nestjs/common';

export class CentroCustoSemAprovadorException extends BadRequestException {
  constructor(filialId: number, centroCustoId: number) {
    super(
      `O centro de custo ${centroCustoId} da filial ${filialId} não possui aprovador vigente. Defina um aprovador antes de vincular solicitantes.`,
    );
  }
}
