import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { AprovadorCentroCustoRepositoryContract } from './aprovador-centro-custo-repository.contract';
import { AprovadorCentroCusto } from '../domain/aprovador-centro-custo';
import { CentroCusto } from '../domain/centro-custo';
import { PrismaCentroCustoMapper } from './prisma-centro-custo.mapper';
import { PrismaAprovadorCentroCustoMapper } from './prisma-aprovador-centro-custo.mapper';

@Injectable()
export class PrismaAprovadorCentroCustoRepository extends AprovadorCentroCustoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscarCentroCusto(
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

  async buscarPorUsuario(
    usuarioId: number,
  ): Promise<AprovadorCentroCusto | null> {
    return PrismaAprovadorCentroCustoMapper.toDomain(
      await this.prismaService.aprovadorCentroCusto.findUnique({
        where: { nCdUsuario: usuarioId },
      }),
    );
  }

  async vincular(
    aprovador: AprovadorCentroCusto,
  ): Promise<AprovadorCentroCusto> {
    return PrismaAprovadorCentroCustoMapper.toDomain(
      await this.prismaService.aprovadorCentroCusto.create({
        data: {
          nCdUsuario: aprovador.usuarioId,
          nCdFilial: aprovador.filialId,
          nCdCentroCusto: aprovador.centroCustoId,
        },
      }),
    );
  }
}
