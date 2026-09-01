import { ForbiddenException } from '@nestjs/common';

export class SolicitacaoDeOutroSolicitanteException extends ForbiddenException {
  constructor(id: number) {
    super(`A solicitação ${id} pertence a outro solicitante`);
  }
}
