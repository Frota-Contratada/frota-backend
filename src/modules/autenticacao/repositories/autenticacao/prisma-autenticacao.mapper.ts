import { Usuario } from '@prisma/client';
import { PrismaUsuarioMapper } from '@module/usuario/info/repositories/prisma-usuario.mapper';
import { Autenticacao } from '@module/autenticacao/domain/autenticacao';

export class PrismaAutenticacaoMapper {
  static toDomain(entity: Usuario): Autenticacao;
  static toDomain(entity: Usuario | null): Autenticacao | null;
  static toDomain(entity: Usuario | null): Autenticacao | null {
    return entity
      ? new Autenticacao(
          PrismaUsuarioMapper.toDomain(entity),
          entity.cHashSenha ?? undefined,
          undefined,
        )
      : null;
  }
}
