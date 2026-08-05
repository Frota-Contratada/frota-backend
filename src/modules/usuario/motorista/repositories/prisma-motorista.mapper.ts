import { Usuario as PrismaUsuario } from '@prisma/client';
import { Motorista } from '../domain/motorista';
import { DateTime } from 'luxon';

export class PrismaMotoristaMapper {
  static toDomain(entity: PrismaUsuario): Motorista;
  static toDomain(entity: PrismaUsuario | null): Motorista | null;
  static toDomain(entity: PrismaUsuario | null): Motorista | null {
    if (entity == null || entity.nCdFornecedor == null) return null;

    return new Motorista(
      entity.cNmUsuario,
      entity.cEmail,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.nCdUsuario.toNumber(),
      entity.nCdFornecedor.toNumber(),
      entity.cCPF ?? undefined,
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
    );
  }
}
