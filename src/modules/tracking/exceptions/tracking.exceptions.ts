import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  NotFoundException,
} from '@nestjs/common';

export class TrackingCorridaNaoEncontradaException extends NotFoundException {
  constructor(id: number) {
    super(`Corrida com id ${id} não encontrada.`);
  }
}

export class TrackingAcessoNegadoException extends ForbiddenException {
  constructor() {
    super(
      'O usuário não tem permissão para acompanhar ou alterar esta corrida.',
    );
  }
}

export class CorridaTrackingInativaException extends ConflictException {
  constructor() {
    super('A corrida precisa estar em andamento para executar este comando.');
  }
}

export class ParadaTrackingNaoEncontradaException extends NotFoundException {
  constructor(sequence: number) {
    super(`Parada de sequência ${sequence} não encontrada nesta corrida.`);
  }
}

export class IdempotencyKeyInvalidaException extends ConflictException {
  constructor(
    message = 'Idempotency-Key ausente ou inválida; informe um UUID.',
  ) {
    super(message);
  }
}

export class IdempotencyEmProcessamentoException extends ConflictException {
  constructor() {
    super('Já existe um comando com esta chave em processamento.');
  }
}

export class TomTomFalhaException extends BadGatewayException {
  constructor() {
    super('Não foi possível calcular a rota no provedor de navegação.');
  }
}

export class TomTomTimeoutException extends GatewayTimeoutException {
  constructor() {
    super('O provedor de navegação excedeu o tempo limite.');
  }
}
