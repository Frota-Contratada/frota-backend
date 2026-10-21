import { ConflictException } from '@nestjs/common';

export class DespesaCorridaNaoPermitidaException extends ConflictException {
  constructor(corridaId: number) {
    super(
      `A corrida ${corridaId} precisa estar em andamento ou finalizada para receber despesas.`,
    );
  }
}
