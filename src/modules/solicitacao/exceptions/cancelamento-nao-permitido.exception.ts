import { ForbiddenException } from '@nestjs/common';

export class CancelamentoNaoPermitidoException extends ForbiddenException {
  constructor(id: number) {
    super(
      `O usuário autenticado não pode cancelar a solicitação ${id}: somente o solicitante, um aprovador do rateio ou um administrador da filial`,
    );
  }
}
