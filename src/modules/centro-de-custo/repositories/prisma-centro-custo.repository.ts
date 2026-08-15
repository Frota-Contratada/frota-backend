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

  async existeAprovadorNoCentroCusto(
    filialId: number,
    centroCustoId: number,
  ): Promise<boolean> {
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
      select: { nCdUsuario: true },
    });

    return aprovador !== null;
  }
}
