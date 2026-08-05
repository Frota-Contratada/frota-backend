import { ConflictException } from '@nestjs/common';

export class AprovadorJaVinculadoException extends ConflictException {
  constructor(usuarioId: number, centroCustoId: number) {
    super(
      `Usuário ${usuarioId} já é aprovador do centro de custo ${centroCustoId}. Uma pessoa só pode ser aprovadora de um centro de custo`,
    );
  }
}
