import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { CorridaAcessoNegadoException } from '../exceptions/corrida-acesso-negado.exception';
import { CorridaNaoEncontradaException } from '../exceptions/corrida-nao-encontrada.exception';
import { CorridaNaoPodeSerCanceladaException } from '../exceptions/corrida-nao-pode-ser-cancelada.exception';
import { CorridaDto } from '../controllers/dtos/response/corrida.dto';
import { PrismaCorridaRepository } from '../repositories/prisma-corrida.repository';

@Injectable()
export class CancelarCorridaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly corridaRepository: PrismaCorridaRepository,
  ) {}

  async execute(
    id: number,
    usuario: AuthenticatedUser,
    motivoCancelamentoId: number,
  ): Promise<CorridaDto> {
    await this.prismaService.$transaction(
      async (tx) => {
        const corrida = await tx.corrida.findUnique({
          where: { nCdCorrida: id },
          include: { Solicitacao: true },
        });
        if (corrida == null) throw new CorridaNaoEncontradaException(id);

        const ehSolicitante =
          corrida.Solicitacao.nCdSolicitante.toNumber() === usuario.id;
        const ehMotorista = corrida.nCdMotorista.toNumber() === usuario.id;
        if (!ehSolicitante && !ehMotorista) {
          throw new CorridaAcessoNegadoException();
        }

        const limite = new Date(corrida.Solicitacao.dCorrida);
        limite.setMinutes(limite.getMinutes() - 15);
        if (
          ![StatusCorrida.AGENDADA, StatusCorrida.INICIADA].includes(
            corrida.cStatus.trim() as StatusCorrida,
          ) ||
          new Date() >= limite
        ) {
          throw new CorridaNaoPodeSerCanceladaException();
        }

        const motivo = await tx.motivo.findFirst({
          where: {
            nCdMotivo: motivoCancelamentoId,
            cTipoMotivo: '2',
            dAtivacao: { lte: new Date() },
            OR: [{ dDesativacao: null }, { dDesativacao: { gt: new Date() } }],
          },
          select: { cNmMotivo: true },
        });
        if (motivo == null) {
          throw new CorridaNaoPodeSerCanceladaException();
        }

        await tx.corrida.update({
          where: { nCdCorrida: id },
          data: { cStatus: StatusCorrida.CANCELADA },
        });

        if (ehSolicitante) {
          await tx.solicitacao.update({
            where: { nCdSolicitacao: corrida.nCdSolicitacao },
            data: {
              cStatus: 'C',
              nCdMotivoCancelamento: motivoCancelamentoId,
            },
          });
        } else {
          const ultimaRecusa = await tx.recusaCorrida.aggregate({
            _max: { nCdRecusaCorrida: true },
          });
          await tx.recusaCorrida.create({
            data: {
              nCdRecusaCorrida:
                (ultimaRecusa._max.nCdRecusaCorrida?.toNumber() ?? 0) + 1,
              nCdCorrida: id,
              nCdMotorista: usuario.id,
              cMotivo: motivo.cNmMotivo,
            },
          });
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.buscarCorrida(id, usuario);
  }

  private async buscarCorrida(
    id: number,
    usuario: AuthenticatedUser,
  ): Promise<CorridaDto> {
    return CorridaDto.fromRecord(
      await this.corridaRepository.buscar(id, usuario),
    );
  }
}
