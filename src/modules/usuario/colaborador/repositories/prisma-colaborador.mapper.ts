import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { UsuarioPerfil } from '@module/usuario/info/domain/usuario-perfil';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorSummary } from '../domain/types/colaborador-summary.type';

export const COLABORADOR_SELECT = {
  nCdUsuario: true,
  cNmUsuario: true,
  cEmail: true,
  cCargo: true,
  cCaminhoFotoPerfil: true,
} satisfies Prisma.UsuarioSelect;

export type PrismaColaboradorRow = Prisma.UsuarioGetPayload<{
  select: typeof COLABORADOR_SELECT;
}>;

export type PrismaColaboradorComPerfis = Prisma.UsuarioGetPayload<{
  include: { UsuarioPerfil: true };
}>;

export class PrismaColaboradorMapper {
  static toSummary(entity: PrismaColaboradorRow): ColaboradorSummary {
    return {
      id: entity.nCdUsuario.toNumber(),
      nome: entity.cNmUsuario,
      email: entity.cEmail,
      cargo: entity.cCargo ?? undefined,
      caminhoFotoPerfil: entity.cCaminhoFotoPerfil ?? undefined,
    };
  }

  static toDomain(entity: PrismaColaboradorComPerfis): Colaborador;
  static toDomain(
    entity: PrismaColaboradorComPerfis | null,
  ): Colaborador | null;
  static toDomain(
    entity: PrismaColaboradorComPerfis | null,
  ): Colaborador | null {
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

    return new Colaborador(
      entity.cNmUsuario,
      entity.cEmail,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.nCdUsuario.toNumber(),
      entity.cCargo ?? undefined,
      entity.nCdCentroCusto == null
        ? undefined
        : entity.nCdCentroCusto.toNumber(),
      entity.cCPF ?? undefined,
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
      perfis,
      entity.nCdFilial == null ? undefined : entity.nCdFilial.toNumber(),
      entity.cCaminhoFotoPerfil ?? undefined,
    );
  }
}
