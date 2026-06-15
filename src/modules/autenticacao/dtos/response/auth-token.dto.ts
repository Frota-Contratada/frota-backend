import { DateTime } from 'luxon';

export class AuthTokenDto {
  accessToken: String;
  refreshToken: String;
  expirationDate: DateTime;
}
