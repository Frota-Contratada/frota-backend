import { ConflictException } from '@nestjs/common';

export class SolicitacaoHorarioDuplicadoException extends ConflictException {
  constructor() {
    super(
      'Já existe uma solicitação para este solicitante nesta data e horário.',
    );
  }
}
