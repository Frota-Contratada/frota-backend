import { Injectable } from '@nestjs/common';
import { FornecedorRepositoryContract } from './fornecedor-repository.contract';
import { Fornecedor } from '../domain/fornecedor';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { PrismaFornecedorMapper } from './prisma-fornecedor.mapper';

@Injectable()
export class PrismaFornecedorRepository extends FornecedorRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
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
  }): Promise<Fornecedor[]> {
    const fornecedores = await this.prismaService.fornecedor.findMany({
      where: {
        ...(filtros.cnpjCpf ? { cCNPJCPF: { contains: filtros.cnpjCpf } } : {}),
        ...(filtros.nome ? { cNmFornecedor: { contains: filtros.nome } } : {}),
      },
      orderBy: { cNmFornecedor: 'asc' },
    });

    return fornecedores.map((fornecedor) =>
      PrismaFornecedorMapper.toDomain(fornecedor),
    );
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
