import { BadRequestException } from '@nestjs/common';

export class AprovadorFilialDivergenteException extends BadRequestException {
  constructor(usuarioId: number, filialCentroCusto: number) {
    super(
      `Usuário ${usuarioId} não pertence à filial ${filialCentroCusto} do centro de custo`,
    );
  }
}
