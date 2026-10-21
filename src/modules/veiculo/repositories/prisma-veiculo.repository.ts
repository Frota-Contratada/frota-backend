import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { FornecedorNaoEncontradoException } from '@module/fornecedor/exceptions/fornecedor-nao-encontrado.exception';
import { TipoVeiculoNaoEncontradoException } from '@module/solicitacao/exceptions/tipo-veiculo-nao-encontrado.exception';
import { Veiculo } from '../domain/veiculo';
import {
  FiltrosBuscarVeiculos,
  VeiculoRepositoryContract,
} from './veiculo-repository.contract';
import { INCLUDE_VEICULO, PrismaVeiculoMapper } from './prisma-veiculo.mapper';

@Injectable()
export class PrismaVeiculoRepository extends VeiculoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async criar(veiculo: Veiculo): Promise<Veiculo> {
    return this.prismaService.$transaction(async (tx) => {
      const fornecedor = await tx.fornecedor.findUnique({
        where: { nCdFornecedor: veiculo.fornecedorId },
        select: { nCdFornecedor: true },
      });

      if (!fornecedor) {
        throw new FornecedorNaoEncontradoException(veiculo.fornecedorId);
      }

      const tipoVeiculo = await tx.tipoVeiculo.findUnique({
        where: { nCdTpVeiculo: veiculo.tipoVeiculoId },
        select: { nCdTpVeiculo: true },
      });

      if (!tipoVeiculo) {
        throw new TipoVeiculoNaoEncontradoException(veiculo.tipoVeiculoId);
      }

      const ultimo = await tx.veiculo.aggregate({
        where: { nCdFornecedor: veiculo.fornecedorId },
        _max: { nCdVeiculo: true },
      });

      return PrismaVeiculoMapper.toDomain(
        await tx.veiculo.create({
          data: {
            nCdFornecedor: veiculo.fornecedorId,
            nCdVeiculo: (ultimo._max.nCdVeiculo?.toNumber() ?? 0) + 1,
            nCdTpVeiculo: veiculo.tipoVeiculoId,
            cPlaca: veiculo.placa,
            cModelo: veiculo.modelo ?? null,
          },
          include: INCLUDE_VEICULO,
        }),
      );
    });
  }

  async buscar(fornecedorId: number, id: number): Promise<Veiculo | null> {
    return PrismaVeiculoMapper.toDomain(
      await this.prismaService.veiculo.findUnique({
        where: {
          nCdFornecedor_nCdVeiculo: {
            nCdFornecedor: fornecedorId,
            nCdVeiculo: id,
          },
        },
        include: INCLUDE_VEICULO,
      }),
    );
  }

  async buscarVarios(
    filtros: FiltrosBuscarVeiculos,
  ): Promise<PaginatedResponseInterface<Veiculo>> {
    const where: Prisma.VeiculoWhereInput = {
      ...(filtros.fornecedorId != null
        ? { nCdFornecedor: filtros.fornecedorId }
        : {}),
      ...(filtros.filial != null
        ? {
            Fornecedor: {
              FilialFornecedor: {
                some: {
                  nCdEmpresa: filtros.filial.empresaId,
                  nCdFilial: filtros.filial.filialId,
                },
              },
            },
          }
        : {}),
      ...(filtros.placa ? { cPlaca: { contains: filtros.placa } } : {}),
      ...(filtros.ativo == null
        ? {}
        : filtros.ativo
          ? { dDesativacao: null }
          : { dDesativacao: { not: null } }),
    };

    const [veiculos, totalCount] = await Promise.all([
      this.prismaService.veiculo.findMany({
        where,
        include: INCLUDE_VEICULO,
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
        orderBy: { cPlaca: 'asc' },
      }),
      this.prismaService.veiculo.count({ where }),
    ]);

    return {
      data: veiculos.map((veiculo) => PrismaVeiculoMapper.toDomain(veiculo)),
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async existePlaca(placa: string): Promise<boolean> {
    return (
      (await this.prismaService.veiculo.count({ where: { cPlaca: placa } })) > 0
    );
  }
}
