import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { fusoHorarioOperacao } from '@common/config/fuso-horario';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { CancelarNotificacoesDaSolicitacaoService } from '@module/notificacao/services/cancelar-notificacoes-da-solicitacao.service';
import { NotificarSolicitacaoService } from '@module/notificacao/services/notificar-solicitacao.service';
import { StatusCorrida } from '../enums/status-corrida.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';

export const MOTIVO_CANCELAMENTO_EXPIRACAO_ID = 23;
export const MOTIVO_CANCELAMENTO_NAO_REALIZADA_ID = 24;

export interface SolicitacaoExpirada {
  id: number;
  motivo: string;
}

interface CandidataExpiracao {
  nCdSolicitacao: Prisma.Decimal;
  cStatus: string;
  dCorrida: Date;
}

@Injectable()
export class ExpirarSolicitacoesPendentesService {
  private readonly logger = new Logger(ExpirarSolicitacoesPendentesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cancelarNotificacoes: CancelarNotificacoesDaSolicitacaoService,
    private readonly notificarSolicitacao: NotificarSolicitacaoService,
  ) {}

  async executar(agora: DateTime = DateTime.utc()): Promise<SolicitacaoExpirada[]> {
    const limite = agora.toJSDate();
    const ids = await this.prisma.$transaction(
      async (tx) => {
        const candidatas = await tx.solicitacao.findMany({
          where: {
            cStatus: {
              in: [StatusSolicitacao.PENDENTE, StatusSolicitacao.APROVADA],
            },
            dCorrida: { lte: limite },
            Corrida: {
              none: {
                cStatus: {
                  in: [StatusCorrida.INICIADA, StatusCorrida.FINALIZADA],
                },
              },
            },
          },
          select: {
            nCdSolicitacao: true,
            cStatus: true,
            dCorrida: true,
          },
        });

        const canceladas: SolicitacaoExpirada[] = [];
        for (const candidata of candidatas as CandidataExpiracao[]) {
          const solicitacaoId = candidata.nCdSolicitacao.toNumber();
          const prazo = this.prazoDaCandidata(candidata, agora);
          if (agora.toMillis() < prazo.toMillis()) continue;

          const motivoId =
            candidata.cStatus === StatusSolicitacao.APROVADA
              ? MOTIVO_CANCELAMENTO_NAO_REALIZADA_ID
              : MOTIVO_CANCELAMENTO_EXPIRACAO_ID;
          const resultado = await tx.solicitacao.updateMany({
            where: {
              nCdSolicitacao: solicitacaoId,
              cStatus: candidata.cStatus,
              dCorrida: { lte: limite },
              Corrida: {
                none: {
                  cStatus: {
                    in: [StatusCorrida.INICIADA, StatusCorrida.FINALIZADA],
                  },
                },
              },
            },
            data: {
              cStatus: StatusSolicitacao.CANCELADA,
              nCdMotivoCancelamento: motivoId,
            },
          });

          if (resultado.count === 1) {
            await tx.corrida.updateMany({
              where: {
                nCdSolicitacao: solicitacaoId,
                cStatus: StatusCorrida.AGENDADA,
              },
              data: { cStatus: StatusCorrida.CANCELADA },
            });
            canceladas.push({
              id: solicitacaoId,
              motivo:
                candidata.cStatus === StatusSolicitacao.APROVADA
                  ? 'Solicitação aprovada, mas não realizada até o final do dia da corrida.'
                  : 'Solicitação cancelada porque não foi aprovada até o horário da corrida.',
            });
          }
        }

        return canceladas;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    for (const cancelada of ids) {
      await this.processarEfeitosPosCancelamento(
        cancelada.id,
        cancelada.motivo,
      );
    }

    return ids;
  }

  private prazoDaCandidata(
    candidata: CandidataExpiracao,
    agora: DateTime,
  ): DateTime {
    if (candidata.cStatus === StatusSolicitacao.PENDENTE) return agora;

    return DateTime.fromJSDate(candidata.dCorrida)
      .setZone(fusoHorarioOperacao())
      .endOf('day')
      .toUTC();
  }

  private async processarEfeitosPosCancelamento(
    id: number,
    motivo: string,
  ): Promise<void> {
    try {
      await this.cancelarNotificacoes.execute(id);
    } catch (error) {
      this.logger.warn(
        `Não foi possível cancelar lembretes da solicitação expirada ${id}: ${String(error)}`,
      );
    }

    try {
      await this.notificarSolicitacao.solicitacaoCancelada(id, { motivo });
    } catch (error) {
      this.logger.warn(
        `Não foi possível notificar a expiração da solicitação ${id}: ${String(error)}`,
      );
    }
  }
}
