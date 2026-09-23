import { ForbiddenException } from '@nestjs/common';

export class AprovadorNaoAutorizadoException extends ForbiddenException {
  constructor(solicitacaoId: number) {
    super(
      `O aprovador autenticado não pode decidir o rateio da solicitação ${solicitacaoId}.`,
    );
  }
}
