import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
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
    empresaId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<CentroCusto | null> {
    return PrismaCentroCustoMapper.toDomain(
      await this.prismaService.centroCusto.findUnique({
        where: {
          nCdEmpresa_nCdFilial_nCdCentroCusto: {
            nCdEmpresa: empresaId,
            nCdFilial: filialId,
            nCdCentroCusto: centroCustoId,
          },
        },
      }),
    );
  }

  async buscarVarios(filtros: {
    empresaId?: number;
    filialId?: number;
    nome?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<CentroCusto>> {
    const where = {
      ...(filtros.empresaId !== undefined
        ? { nCdEmpresa: filtros.empresaId }
        : {}),
      ...(filtros.filialId !== undefined
        ? { nCdFilial: filtros.filialId }
        : {}),
      ...(filtros.nome ? { cNmCentroCusto: { contains: filtros.nome } } : {}),
    };
    const skip = (filtros.page - 1) * filtros.limit;

    const [centrosCusto, totalCount] = await Promise.all([
      this.prismaService.centroCusto.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { cNmCentroCusto: 'asc' },
      }),
      this.prismaService.centroCusto.count({ where }),
    ]);

    return {
      data: centrosCusto.map((centroCusto) =>
        PrismaCentroCustoMapper.toDomain(centroCusto),
      ),
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async buscarPorFilial(
    empresaId: number,
    filialId: number,
  ): Promise<CentroCusto[]> {
    const centrosCusto = await this.prismaService.centroCusto.findMany({
      where: { nCdEmpresa: empresaId, nCdFilial: filialId },
      orderBy: { nCdCentroCusto: 'asc' },
    });

    return centrosCusto.map((centroCusto) =>
      PrismaCentroCustoMapper.toDomain(centroCusto),
    );
  }

  async buscarIdsComAprovador(
    empresaId: number,
    filialId: number,
  ): Promise<number[]> {
    const agora = new Date();

    const aprovadores = await this.prismaService.usuario.findMany({
      where: {
        nCdEmpresa: empresaId,
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
    empresaId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean> {
    return (
      (await this.buscarAprovadorId(empresaId, filialId, centroCustoId)) !==
      null
    );
  }

  async buscarAprovadorId(
    empresaId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<number | null> {
    const agora = new Date();

    const aprovador = await this.prismaService.usuario.findFirst({
      where: {
        nCdEmpresa: empresaId,
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
