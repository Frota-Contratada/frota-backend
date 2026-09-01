import { Motivo as PrismaMotivo } from '@prisma/client';
import { DateTime } from 'luxon';
import { Motivo } from '../domain/motivo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export class PrismaMotivoMapper {
  static toDomain(entity: PrismaMotivo): Motivo;
  static toDomain(entity: PrismaMotivo | null): Motivo | null;
  static toDomain(entity: PrismaMotivo | null): Motivo | null {
    if (entity == null) return null;

    return new Motivo(
      entity.nCdMotivo.toNumber(),
      entity.cNmMotivo,
      entity.cTipoMotivo as TipoMotivo,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.nCdFilial == null ? undefined : entity.nCdFilial.toNumber(),
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
    );
  }
}
