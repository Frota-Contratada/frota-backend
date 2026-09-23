import { ConflictException } from '@nestjs/common';

export class SolicitacaoNaoPodeSerAprovadaException extends ConflictException {
  constructor(id: number) {
    super(`A solicitação ${id} não está aguardando aprovação.`);
  }
}
