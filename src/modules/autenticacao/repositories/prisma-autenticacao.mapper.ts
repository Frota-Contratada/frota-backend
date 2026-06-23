import { Usuario } from '@prisma/client';
import { Autenticacao } from '../domain/autenticacao';
import { PrismaUsuarioMapper } from '@module/usuario/info/repositories/prisma-usuario.mapper';

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
