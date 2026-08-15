import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { FornecedorRepositoryContract } from './fornecedor-repository.contract';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorBigNumbers } from '../domain/types/fornecedor-big-numbers.type';
import { FornecedorSummary } from '../domain/types/fornecedor-summary.type';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { PrismaFornecedorMapper } from './prisma-fornecedor.mapper';

@Injectable()
export class PrismaFornecedorRepository extends FornecedorRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }
  private filtroDeVinculoComContratoVigente(
    filialId?: number,
  ): Prisma.FilialFornecedorWhereInput {
    const hoje = DateTime.now().startOf('day').toJSDate();

    return {
      ...(filialId ? { nCdFilial: filialId } : {}),
      Contrato: {
        dVigenciaInicio: { lte: hoje },
        OR: [{ dVigenciaFim: null }, { dVigenciaFim: { gte: hoje } }],
      },
    };
  }

  async buscar(id: number): Promise<Fornecedor | null> {
    return PrismaFornecedorMapper.toDomain(
      await this.prismaService.fornecedor.findUnique({
        where: {
          nCdFornecedor: Number(id),
        },
      }),
    );
  }

  async buscarVarios(filtros: {
    nome?: string;
    cnpjCpf?: string;
    filialId?: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<FornecedorSummary>> {
    const vinculoComContratoVigente = this.filtroDeVinculoComContratoVigente(
      filtros.filialId,
    );
    const where = {
      ...(filtros.cnpjCpf ? { cCNPJCPF: { contains: filtros.cnpjCpf } } : {}),
      ...(filtros.nome ? { cNmFornecedor: { contains: filtros.nome } } : {}),
      ...(filtros.filialId
        ? { FilialFornecedor: { some: { nCdFilial: filtros.filialId } } }
        : {}),
    };
    const skip = (filtros.page - 1) * filtros.limit;

    const [fornecedores, totalCount] = await Promise.all([
      this.prismaService.fornecedor.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { cNmFornecedor: 'asc' },
        include: {
          _count: { select: { Veiculo: { where: { dDesativacao: null } } } },
          FilialFornecedor: {
            where: vinculoComContratoVigente,
            orderBy: [{ nCdFilial: 'asc' }, { nCdContrato: 'asc' }],
            select: {
              nCdFilial: true,
              Filial: { select: { cNmFilial: true } },
              Contrato: true,
            },
          },
        },
      }),
      this.prismaService.fornecedor.count({ where }),
    ]);

    const data = fornecedores.map((fornecedor) =>
      PrismaFornecedorMapper.toSummary(fornecedor),
    );

    return {
      data,
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async buscarBigNumbers(filtros: {
    nome?: string;
    cnpjCpf?: string;
    filialId?: number;
  }): Promise<FornecedorBigNumbers> {
    const whereBase: Prisma.FornecedorWhereInput = {
      dDesativacao: null,
      ...(filtros.cnpjCpf ? { cCNPJCPF: { contains: filtros.cnpjCpf } } : {}),
      ...(filtros.nome ? { cNmFornecedor: { contains: filtros.nome } } : {}),
      ...(filtros.filialId
        ? { FilialFornecedor: { some: { nCdFilial: filtros.filialId } } }
        : {}),
    };

    const whereComContratoVigente: Prisma.FornecedorWhereInput = {
      AND: [
        whereBase,
        {
          FilialFornecedor: {
            some: this.filtroDeVinculoComContratoVigente(filtros.filialId),
          },
        },
      ],
    };

    const [fornecedoresAtivos, fornecedoresComContratoVigente, veiculosAtivos] =
      await Promise.all([
        this.prismaService.fornecedor.count({ where: whereBase }),
        this.prismaService.fornecedor.count({
          where: whereComContratoVigente,
        }),
        this.prismaService.veiculo.count({
          where: { dDesativacao: null, Fornecedor: whereBase },
        }),
      ]);

    return {
      fornecedoresAtivos,
      fornecedoresComContratoVigente,
      fornecedoresSemContratoVigente:
        fornecedoresAtivos - fornecedoresComContratoVigente,
      veiculosAtivos,
    };
  }

  async criar(fornecedor: Fornecedor): Promise<Fornecedor> {
    return this.prismaService.$transaction(async (tx) => {
      const ultimo = await tx.fornecedor.aggregate({
        _max: { nCdFornecedor: true },
      });
      const proximoId = (ultimo._max.nCdFornecedor?.toNumber() ?? 0) + 1;

      return PrismaFornecedorMapper.toDomain(
        await tx.fornecedor.create({
          data: {
            nCdFornecedor: proximoId,
            cNmFornecedor: fornecedor.nome,
            cCNPJCPF: fornecedor.cnpjCpf,
          },
        }),
      );
    });
  }

  async atualizarFoto(id: number, caminhoArquivo: string): Promise<Fornecedor> {
    return PrismaFornecedorMapper.toDomain(
      await this.prismaService.cliente.fornecedor.update({
        where: { nCdFornecedor: id },
        data: { cCaminhoArquivo: caminhoArquivo },
      }),
    );
  }

  async existePorNomeNaFilial(
    nome: string,
    filialId: number,
  ): Promise<boolean> {
    const resultado = await this.prismaService.filialFornecedor.findFirst({
      where: {
        nCdFilial: filialId,
        Fornecedor: {
          cNmFornecedor: nome,
        },
      },
      select: { nCdFornecedor: true },
    });
    return resultado !== null;
  }

  async existePorCnpjCpf(cnpjCpf: string): Promise<boolean> {
    const resultado = await this.prismaService.fornecedor.findUnique({
      where: { cCNPJCPF: cnpjCpf },
      select: { nCdFornecedor: true },
    });
    return resultado !== null;
  }
}
