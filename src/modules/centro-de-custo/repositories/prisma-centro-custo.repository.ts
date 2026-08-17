import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CentroCusto } from '../domain/centro-custo';
import { CentroCustoRepositoryContract } from './centro-custo-repository.contract';
import { PrismaCentroCustoMapper } from './prisma-centro-custo.mapper';

@Injectable()
export class PrismaCentroCustoRepository extends CentroCustoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscar(
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null> {
    return PrismaCentroCustoMapper.toDomain(
      await this.prismaService.centroCusto.findUnique({
        where: {
          nCdFilial_nCdCentroCusto: {
            nCdFilial: filialId,
            nCdCentroCusto: centroCustoId,
          },
        },
      }),
    );
  }

  async buscarPorFilial(filialId: number): Promise<CentroCusto[]> {
    const centrosCusto = await this.prismaService.centroCusto.findMany({
      where: { nCdFilial: filialId },
      orderBy: { nCdCentroCusto: 'asc' },
    });

    return centrosCusto.map((centroCusto) =>
      PrismaCentroCustoMapper.toDomain(centroCusto),
    );
  }

  async buscarIdsComAprovador(filialId: number): Promise<number[]> {
    const agora = new Date();

    const aprovadores = await this.prismaService.usuario.findMany({
      where: {
        nCdFilial: filialId,
        nCdCentroCusto: { not: null },
        dDesativacao: null,
        UsuarioPerfil: {
          some: {
            cTipoPerfil: TipoPerfil.APROVADOR,
            dInicioVigencia: { lte: agora },
            OR: [{ dFimVigencia: null }, { dFimVigencia: { gt: agora } }],
          },
        },
      },
      select: { nCdCentroCusto: true },
      distinct: ['nCdCentroCusto'],
    });

    return aprovadores.flatMap((aprovador) =>
      aprovador.nCdCentroCusto == null
        ? []
        : [aprovador.nCdCentroCusto.toNumber()],
    );
  }

  async existeAprovadorNoCentroCusto(
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean> {
    return (await this.buscarAprovadorId(filialId, centroCustoId)) !== null;
  }

  async buscarAprovadorId(
    filialId: number,
    centroCustoId: number,
  ): Promise<number | null> {
    const agora = new Date();

    const aprovador = await this.prismaService.usuario.findFirst({
      where: {
        nCdFilial: filialId,
        nCdCentroCusto: centroCustoId,
        dDesativacao: null,
        UsuarioPerfil: {
          some: {
            cTipoPerfil: TipoPerfil.APROVADOR,
            dInicioVigencia: { lte: agora },
            OR: [{ dFimVigencia: null }, { dFimVigencia: { gt: agora } }],
          },
        },
      },
      orderBy: { nCdUsuario: 'asc' },
      select: { nCdUsuario: true },
    });

    return aprovador === null ? null : aprovador.nCdUsuario.toNumber();
  }
}
