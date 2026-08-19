import { BadRequestException } from '@nestjs/common';

export class SolicitanteSemFilialException extends BadRequestException {
  constructor(solicitanteId: number) {
    super(
      `Solicitante ${solicitanteId} não está vinculado a uma filial. O vínculo é necessário para resolver os centros de custo e os contratos da corrida`,
    );
  }
}
