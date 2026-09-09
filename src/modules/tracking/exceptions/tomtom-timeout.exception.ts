import { GatewayTimeoutException } from '@nestjs/common';

export class TomTomTimeoutException extends GatewayTimeoutException {
  constructor() {
    super('O provedor de navegação excedeu o tempo limite.');
  }
}
