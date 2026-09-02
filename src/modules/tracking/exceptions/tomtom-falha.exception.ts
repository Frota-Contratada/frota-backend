import { BadGatewayException } from '@nestjs/common';

export class TomTomFalhaException extends BadGatewayException {
  constructor() {
    super('Não foi possível calcular a rota no provedor de navegação.');
  }
}
