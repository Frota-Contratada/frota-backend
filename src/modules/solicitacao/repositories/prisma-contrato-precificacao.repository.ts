import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { ContratoPrecificacaoRepositoryContract } from './contrato-precificacao-repository.contract';
import { PrismaContratoPrecificacaoMapper } from './prisma-contrato-precificacao.mapper';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';

@Injectable()
export class PrismaContratoPrecificacaoRepository extends ContratoPrecificacaoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscarCandidatos(
    filialId: number,
    tipoCorridaId: number,
    data: DateTime,
  ): Promise<ContratoPrecificacao[]> {
    const dia = data.startOf('day').toJSDate();

    const vinculos = await this.prismaService.filialFornecedor.findMany({
      where: {
        nCdFilial: filialId,
        Fornecedor: { dDesativacao: null },
        Contrato: {
          dVigenciaInicio: { lte: dia },
          OR: [{ dVigenciaFim: null }, { dVigenciaFim: { gte: dia } }],
          ModalidadeContrato: { some: { nCdTipoCorrida: tipoCorridaId } },
        },
      },
      include: {
        Fornecedor: true,
        Contrato: {
          include: {
            Regra: {
              include: { CondicaoRegra: true, TipoRegra: true },
            },
          },
        },
      },
    });

    return vinculos.map((vinculo) =>
      PrismaContratoPrecificacaoMapper.toDomain(vinculo),
    );
  }
}
