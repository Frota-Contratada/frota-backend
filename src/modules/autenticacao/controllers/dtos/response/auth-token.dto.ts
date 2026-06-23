import { DateTime } from 'luxon';

export class AuthTokenDto {
  accessToken: string;
  refreshToken: string;
  validade: DateTime;

  constructor(accessToken: string, refreshToken: string, validade: DateTime) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.validade = validade;
  }
}