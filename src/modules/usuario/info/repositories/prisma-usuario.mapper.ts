import { Prisma, Usuario as PrismaUsuario } from '@prisma/client';
import { Usuario } from '../domain/usuario';
import { UsuarioPerfil } from '../domain/usuario-perfil';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { DateTime } from 'luxon';

type PrismaUsuarioComPerfis = Prisma.UsuarioGetPayload<{
  include: { UsuarioPerfil: true };
}>;

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
      [],
      entity.nCdFilial == null ? undefined : entity.nCdFilial.toNumber(),
    );
  }

  static toDomainComPerfis(
    entity: PrismaUsuarioComPerfis | null,
  ): Usuario | null {
    if (entity == null) return null;

    const tiposPerfil = new Set<string>(Object.values(TipoPerfil));
    const perfis = entity.UsuarioPerfil.flatMap((perfil) => {
      if (!tiposPerfil.has(perfil.cTipoPerfil)) return [];

      return [
        new UsuarioPerfil(
          perfil.nCdUsuario.toNumber(),
          perfil.cTipoPerfil as TipoPerfil,
          DateTime.fromJSDate(perfil.dInicioVigencia),
          perfil.dFimVigencia == null
            ? undefined
            : DateTime.fromJSDate(perfil.dFimVigencia),
        ),
      ];
    });

    return new Usuario(
      entity.cNmUsuario,
      entity.cEmail,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.nCdUsuario.toNumber(),
      entity.cCPF ?? undefined,
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
      perfis,
      entity.nCdFilial == null ? undefined : entity.nCdFilial.toNumber(),
    );
  }
}
