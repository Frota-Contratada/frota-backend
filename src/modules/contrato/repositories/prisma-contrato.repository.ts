import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Contrato } from '../domain/contrato';
import { ContratoRepositoryContract } from './contrato-repository.contract';
import { PrismaContratoMapper } from './prisma-contrato.mapper';

@Injectable()
export class PrismaContratoRepository extends ContratoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
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
}
