import { BadRequestException } from '@nestjs/common';

export class BeneficiarioInvalidoException extends BadRequestException {
  constructor(beneficiarioId: number, motivo: string) {
    super(
      `O colaborador ${beneficiarioId} não pode ser o beneficiário da corrida: ${motivo}`,
    );
  }
}
