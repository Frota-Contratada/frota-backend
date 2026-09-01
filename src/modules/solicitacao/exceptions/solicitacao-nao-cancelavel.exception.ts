import { ConflictException } from '@nestjs/common';

export class SolicitacaoNaoCancelavelException extends ConflictException {
  constructor(id: number) {
    super(
      `Solicitação ${id} não pode ser cancelada: ela já foi cancelada, reprovada ou a corrida já foi iniciada`,
    );
  }
}
