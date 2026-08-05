import { AprovadorCentroCusto as PrismaAprovadorCentroCusto } from '@prisma/client';
import { DateTime } from 'luxon';
import { AprovadorCentroCusto } from '../domain/aprovador-centro-custo';

export class PrismaAprovadorCentroCustoMapper {
  static toDomain(entity: PrismaAprovadorCentroCusto): AprovadorCentroCusto;
  static toDomain(
    entity: PrismaAprovadorCentroCusto | null,
  ): AprovadorCentroCusto | null;
  static toDomain(
    entity: PrismaAprovadorCentroCusto | null,
  ): AprovadorCentroCusto | null {
    if (entity == null) return null;

    return new AprovadorCentroCusto(
      entity.nCdUsuario.toNumber(),
      entity.nCdFilial.toNumber(),
      entity.nCdCentroCusto.toNumber(),
      DateTime.fromJSDate(entity.dVinculo),
    );
  }
}
