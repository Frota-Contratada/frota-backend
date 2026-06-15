import { TipoToken } from '@module/autenticacao/enums/tipo-token.enum';
import { DateTime } from 'luxon';

export class ConfirmarPinResponseDto {
  token: String;
  tipoToken: TipoToken;
  expirationDate: DateTime
}
