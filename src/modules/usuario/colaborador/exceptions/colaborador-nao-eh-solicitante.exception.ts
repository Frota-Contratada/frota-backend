import { BadRequestException } from '@nestjs/common';

export class ColaboradorNaoEhSolicitanteException extends BadRequestException {
  constructor(id: number) {
    super(
      `Colaborador ${id} precisa ter o perfil de solicitante vigente antes de se tornar solicitante de emergência`,
    );
  }
}
