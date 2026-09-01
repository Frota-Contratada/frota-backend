import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Motivo } from '../domain/motivo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import {
  BuscarMotivosFiltros,
  ExistePorNomeFiltros,
  MotivoRepositoryContract,
} from './motivo-repository.contract';
import { PrismaMotivoMapper } from './prisma-motivo.mapper';

@Injectable()
export class PrismaMotivoRepository extends MotivoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  /**
   * Motivo global é representado por `nCdFilial = NULL`. Sem filtro de escopo
   * a consulta abrange globais e de todas as filiais.
   */
  private filtroDeEscopo(filtros: {
    filialId?: number;
    apenasGlobais?: boolean;
  }): Prisma.MotivoWhereInput {
    if (filtros.apenasGlobais) {
      return { nCdFilial: null };
    }

    if (filtros.filialId !== undefined) {
      return { OR: [{ nCdFilial: filtros.filialId }, { nCdFilial: null }] };
    }

    return {};
  }

  async buscar(id: number): Promise<Motivo | null> {
    return PrismaMotivoMapper.toDomain(
      await this.prismaService.cliente.motivo.findUnique({
        where: { nCdMotivo: id },
      }),
    );
  }

  async buscarVarios(
    filtros: BuscarMotivosFiltros,
  ): Promise<PaginatedResponseInterface<Motivo>> {
    const where: Prisma.MotivoWhereInput = {
      ...this.filtroDeEscopo(filtros),
      ...(filtros.incluirInativos ? {} : { dDesativacao: null }),
      ...(filtros.nome ? { cNmMotivo: { contains: filtros.nome } } : {}),
      ...(filtros.tipo ? { cTipoMotivo: filtros.tipo } : {}),
    };
    const skip = (filtros.page - 1) * filtros.limit;

    const [motivos, totalCount] = await Promise.all([
      this.prismaService.cliente.motivo.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: [{ cTipoMotivo: 'asc' }, { cNmMotivo: 'asc' }],
      }),
      this.prismaService.cliente.motivo.count({ where }),
    ]);

    return {
      data: motivos.map((motivo) => PrismaMotivoMapper.toDomain(motivo)),
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async criar(motivo: Motivo): Promise<Motivo> {
    return this.prismaService.executarEmTransacao(async () => {
      const ultimo = await this.prismaService.cliente.motivo.aggregate({
        _max: { nCdMotivo: true },
      });
      const proximoId = (ultimo._max.nCdMotivo?.toNumber() ?? 0) + 1;

      return PrismaMotivoMapper.toDomain(
        await this.prismaService.cliente.motivo.create({
          data: {
            nCdMotivo: proximoId,
            nCdFilial: motivo.filialId ?? null,
            cNmMotivo: motivo.nome,
            cTipoMotivo: motivo.tipo,
          },
        }),
      );
    });
  }

  async atualizar(id: number, nome: string, tipo: TipoMotivo): Promise<Motivo> {
    return PrismaMotivoMapper.toDomain(
      await this.prismaService.cliente.motivo.update({
        where: { nCdMotivo: id },
        data: { cNmMotivo: nome, cTipoMotivo: tipo },
      }),
    );
  }

  async desativar(id: number): Promise<Motivo> {
    return PrismaMotivoMapper.toDomain(
      await this.prismaService.cliente.motivo.update({
        where: { nCdMotivo: id },
        data: { dDesativacao: DateTime.now().toJSDate() },
      }),
    );
  }

  async existePorNome(filtros: ExistePorNomeFiltros): Promise<boolean> {
    const motivo = await this.prismaService.cliente.motivo.findFirst({
      where: {
        cNmMotivo: filtros.nome,
        cTipoMotivo: filtros.tipo,
        dDesativacao: null,
        ...this.filtroDeEscopo({
          filialId: filtros.filialId,
          apenasGlobais: filtros.filialId === undefined,
        }),
        ...(filtros.ignorarId !== undefined
          ? { nCdMotivo: { not: filtros.ignorarId } }
          : {}),
      },
      select: { nCdMotivo: true },
    });

    return motivo !== null;
  }
}
