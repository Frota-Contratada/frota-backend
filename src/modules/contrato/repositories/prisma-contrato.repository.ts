import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Contrato } from '../domain/contrato';
import { ContratoBigNumbers } from '../domain/types/contrato-big-numbers.type';
import { ContratoSummary } from '../domain/types/contrato-summary.type';
import { DIAS_PARA_VENCER_EM_BREVE } from '../enums/status-contrato.enum';
import { ContratoRepositoryContract } from './contrato-repository.contract';
import {
  CONTRATO_VINCULO_SELECT,
  PrismaContratoMapper,
} from './prisma-contrato.mapper';

@Injectable()
export class PrismaContratoRepository extends ContratoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private filtroDeVinculo(filtros: {
    filialId?: number;
    fornecedorId?: number;
  }): Prisma.FilialFornecedorWhereInput | undefined {
    if (!filtros.filialId && !filtros.fornecedorId) {
      return undefined;
    }

    return {
      ...(filtros.filialId ? { nCdFilial: filtros.filialId } : {}),
      ...(filtros.fornecedorId ? { nCdFornecedor: filtros.fornecedorId } : {}),
    };
  }

  private montarWhere(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Prisma.ContratoWhereInput {
    const vinculo = this.filtroDeVinculo(filtros);

    const vigenciaDe = filtros.vigenciaDe
      ? DateTime.fromJSDate(filtros.vigenciaDe).startOf('day').toJSDate()
      : undefined;
    const vigenciaAte = filtros.vigenciaAte
      ? DateTime.fromJSDate(filtros.vigenciaAte).startOf('day').toJSDate()
      : undefined;

    return {
      ...(vinculo ? { FilialFornecedor: { some: vinculo } } : {}),
      ...(vigenciaAte ? { dVigenciaInicio: { lte: vigenciaAte } } : {}),
      ...(vigenciaDe
        ? {
            OR: [{ dVigenciaFim: null }, { dVigenciaFim: { gte: vigenciaDe } }],
          }
        : {}),
    };
  }

  async criar(contrato: Contrato): Promise<Contrato> {
    return this.prismaService.$transaction(async (tx) => {
      const ultimoContrato = await tx.contrato.aggregate({
        _max: { nCdContrato: true },
      });
      const proximoId = (ultimoContrato._max.nCdContrato?.toNumber() ?? 0) + 1;

      const registro = await tx.contrato.create({
        data: {
          nCdContrato: proximoId,
          cCaminhoArquivo: contrato.caminhoArquivo,
          nCdUsuarioCadastro: contrato.usuarioCadastroId,
          dVigenciaInicio: contrato.dataVigenciaInicio.toJSDate(),
          dVigenciaFim: contrato.dataVigenciaFim?.toJSDate() ?? null,
        },
      });

      return PrismaContratoMapper.toDomain(registro);
    });
  }

  async buscar(id: number): Promise<Contrato | null> {
    return PrismaContratoMapper.toDomain(
      await this.prismaService.contrato.findUnique({
        where: { nCdContrato: id },
      }),
    );
  }

  async buscarVarios(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ContratoSummary>> {
    const hoje = DateTime.now().startOf('day');
    const limiteVenceEmBreve = hoje.plus({ days: DIAS_PARA_VENCER_EM_BREVE });

    const where = this.montarWhere(filtros);
    const vinculo = this.filtroDeVinculo(filtros);
    const skip = (filtros.page - 1) * filtros.limit;

    const [contratos, totalCount] = await Promise.all([
      this.prismaService.contrato.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { dVigenciaInicio: 'desc' },
        include: {
          FilialFornecedor: {
            where: vinculo,
            orderBy: [{ nCdFilial: 'asc' }, { nCdFornecedor: 'asc' }],
            select: CONTRATO_VINCULO_SELECT,
          },
        },
      }),
      this.prismaService.contrato.count({ where }),
    ]);

    const data = contratos.map((contrato) =>
      PrismaContratoMapper.toSummary(contrato, hoje, limiteVenceEmBreve),
    );

    return {
      data,
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async buscarBigNumbers(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Promise<ContratoBigNumbers> {
    const hoje = DateTime.now().startOf('day').toJSDate();
    const limiteVenceEmBreve = DateTime.now()
      .startOf('day')
      .plus({ days: DIAS_PARA_VENCER_EM_BREVE })
      .toJSDate();

    const where = this.montarWhere(filtros);

    const vigente: Prisma.ContratoWhereInput = {
      dVigenciaInicio: { lte: hoje },
      OR: [{ dVigenciaFim: null }, { dVigenciaFim: { gte: hoje } }],
    };

    const [total, validos, vencemEmBreve, vencidos] = await Promise.all([
      this.prismaService.contrato.count({ where }),
      this.prismaService.contrato.count({ where: { AND: [where, vigente] } }),
      this.prismaService.contrato.count({
        where: {
          AND: [
            where,
            {
              dVigenciaInicio: { lte: hoje },
              dVigenciaFim: { gte: hoje, lte: limiteVenceEmBreve },
            },
          ],
        },
      }),
      this.prismaService.contrato.count({
        where: { AND: [where, { dVigenciaFim: { lt: hoje } }] },
      }),
    ]);

    return { total, validos, vencemEmBreve, vencidos };
  }
}
