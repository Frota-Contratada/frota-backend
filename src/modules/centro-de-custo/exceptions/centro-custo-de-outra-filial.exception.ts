import { ForbiddenException } from '@nestjs/common';

export class CentroCustoDeOutraFilialException extends ForbiddenException {
  constructor(centroCustoId: number, filialId: number) {
    super(
      `O centro de custo ${centroCustoId} não pertence à filial ${filialId}`,
    );
  }
}
