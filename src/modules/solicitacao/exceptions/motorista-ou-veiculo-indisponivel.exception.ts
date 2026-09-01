import { ConflictException } from '@nestjs/common';

export class MotoristaOuVeiculoIndisponivelException extends ConflictException {
  constructor() {
    super(
      'O motorista ou veículo informado não está disponível para a reatribuição.',
    );
  }
}
