import { PinUsuario } from '@prisma/client';
import { Pin } from '../../domain/pin';
import { TipoToken } from '../../enums/tipo-token.enum';

export class PrismaPinMapper {
  static toDomain(entity: PinUsuario): Pin;
  static toDomain(entity: PinUsuario | null): Pin | null;
  static toDomain(entity: PinUsuario | null): Pin | null {
    return entity
      ? new Pin(
          Number(entity.nCdPinUsuario),
          Number(entity.nCdUsuario),
          Number(entity.nCdTpToken),
          entity.cPin,
          entity.cToken,
          entity.cUtilizado === 'S',
          entity.dCriacao,
          entity.dExpiracao,
          entity.dUtilizacao,
        )
      : null;
  }
}
