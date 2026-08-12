import { Contrato as PrismaContrato } from '@prisma/client';
import { DateTime } from 'luxon';
import { Contrato } from '../domain/contrato';

export class PrismaContratoMapper {
  static toDomain(entity: PrismaContrato): Contrato;
  static toDomain(entity: PrismaContrato | null): Contrato | null;
  static toDomain(entity: PrismaContrato | null): Contrato | null {
    if (entity == null) return null;

    return new Contrato(
      entity.nCdContrato.toNumber(),
      entity.cCaminhoArquivo,
      entity.nCdUsuarioCadastro.toNumber(),
      DateTime.fromJSDate(entity.dVigenciaInicio),
      entity.dVigenciaFim == null
        ? undefined
        : DateTime.fromJSDate(entity.dVigenciaFim),
      DateTime.fromJSDate(entity.dAlteracao),
    );
  }
}
