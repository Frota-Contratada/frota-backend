import { Usuario as PrismaUsuario } from '@prisma/client';
import { Usuario } from '../domain/usuario';
import { DateTime } from 'luxon';

export class PrismaUsuarioMapper {
  static toDomain(entity: PrismaUsuario): Usuario;
  static toDomain(entity: PrismaUsuario | null): Usuario | null;
  static toDomain(entity: PrismaUsuario | null): Usuario | null {
    if (entity == null) return null;

    return new Usuario(
      entity.cNmUsuario,
      entity.cEmail,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.nCdUsuario.toNumber(),
      entity.cCPF ?? undefined,
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
    );
  }
}
