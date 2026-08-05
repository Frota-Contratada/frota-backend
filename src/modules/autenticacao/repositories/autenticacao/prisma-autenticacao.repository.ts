import { Injectable } from '@nestjs/common';
import { AutenticacaoRepositoryContract } from './autenticacao-repository.contract';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Autenticacao } from '../../domain/autenticacao';
import { PrismaAutenticacaoMapper } from './prisma-autenticacao.mapper';
import { TipoPerfil } from '../../enums/tipo-perfil.enum';

@Injectable()
export class PrismaAutenticacaoRepository extends AutenticacaoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async atualizarSenha(
    usuarioId: number,
    senha: string,
  ): Promise<Autenticacao | null> {
    return PrismaAutenticacaoMapper.toDomain(
      await this.prismaService.usuario.update({
        where: {
          nCdUsuario: usuarioId,
        },
        data: {
          cHashSenha: senha,
        },
      }),
    );
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<Autenticacao | null> {
    return PrismaAutenticacaoMapper.toDomain(
      await this.prismaService.usuario.findUnique({
        where: {
          nCdUsuario: usuarioId,
        },
      }),
    );
  }

  async buscarPerfisVigentes(usuarioId: number): Promise<TipoPerfil[]> {
    const agora = new Date();
    const registros = await this.prismaService.usuarioPerfil.findMany({
      where: {
        nCdUsuario: usuarioId,
        dInicioVigencia: { lte: agora },
        OR: [{ dFimVigencia: null }, { dFimVigencia: { gt: agora } }],
      },
      select: {
        cTipoPerfil: true,
      },
    });

    const tiposPerfil = new Set<string>(Object.values(TipoPerfil));

    return registros
      .map(({ cTipoPerfil }) => cTipoPerfil)
      .filter((tipo): tipo is TipoPerfil => tiposPerfil.has(tipo));
  }

  async buscarPorEmail(email: string): Promise<Autenticacao | null> {
    return PrismaAutenticacaoMapper.toDomain(
      await this.prismaService.usuario.findUnique({
        where: {
          cEmail: email,
        },
      }),
    );
  }
}
