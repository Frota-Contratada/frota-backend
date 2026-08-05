import { CentroCusto as PrismaCentroCusto } from '@prisma/client';
import { DateTime } from 'luxon';
import { CentroCusto } from '../domain/centro-custo';

export class PrismaCentroCustoMapper {
  static toDomain(entity: PrismaCentroCusto): CentroCusto;
  static toDomain(entity: PrismaCentroCusto | null): CentroCusto | null;
  static toDomain(entity: PrismaCentroCusto | null): CentroCusto | null {
    if (entity == null) return null;

    return new CentroCusto(
      entity.nCdFilial.toNumber(),
      entity.nCdCentroCusto.toNumber(),
      entity.cNmCentroCusto,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
    );
  }
}
