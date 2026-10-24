import { DateTime } from 'luxon';
import {
  ExpirarSolicitacoesPendentesService,
  MOTIVO_CANCELAMENTO_EXPIRACAO_ID,
  MOTIVO_CANCELAMENTO_NAO_REALIZADA_ID,
} from './expirar-solicitacoes-pendentes.service';

const decimal = (valor: number) => ({ toNumber: () => valor });

type Candidata = {
  id: number;
  status: 'P' | 'A';
  data: Date;
};

describe('ExpirarSolicitacoesPendentesService', () => {
  const agora = DateTime.utc(2026, 10, 24, 15);

  const criarService = ({
    candidatas = [],
    atualizadas = 0,
  }: { candidatas?: Candidata[]; atualizadas?: number } = {}) => {
    const findMany = jest.fn().mockResolvedValue(
      candidatas.map((candidata) => ({
        nCdSolicitacao: decimal(candidata.id),
        cStatus: candidata.status,
        dCorrida: candidata.data,
      })),
    );
    const updateManySolicitacao = jest
      .fn()
      .mockResolvedValue({ count: atualizadas });
    const updateManyCorrida = jest.fn().mockResolvedValue({ count: 0 });
    const tx = {
      solicitacao: { findMany, updateMany: updateManySolicitacao },
      corrida: { updateMany: updateManyCorrida },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: unknown) => unknown) =>
        callback(tx),
      ),
    };
    const cancelarNotificacoes = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const notificarSolicitacao = {
      solicitacaoCancelada: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ExpirarSolicitacoesPendentesService(
      prisma as never,
      cancelarNotificacoes as never,
      notificarSolicitacao as never,
    );

    return {
      service,
      findMany,
      updateManySolicitacao,
      updateManyCorrida,
      cancelarNotificacoes,
      notificarSolicitacao,
    };
  };

  it('cancela pendentes no instante da corrida', async () => {
    const contexto = criarService({
      candidatas: [{ id: 10, status: 'P', data: agora.toJSDate() }],
      atualizadas: 1,
    });

    await expect(contexto.service.executar(agora)).resolves.toEqual([
      {
        id: 10,
        motivo:
          'Solicitação cancelada porque não foi aprovada até o horário da corrida.',
      },
    ]);

    expect(contexto.updateManySolicitacao).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nCdSolicitacao: 10,
          cStatus: 'P',
          dCorrida: { lte: agora.toJSDate() },
        }),
        data: {
          cStatus: 'C',
          nCdMotivoCancelamento: MOTIVO_CANCELAMENTO_EXPIRACAO_ID,
        },
      }),
    );
    expect(contexto.cancelarNotificacoes.execute).toHaveBeenCalledWith(10);
    expect(
      contexto.notificarSolicitacao.solicitacaoCancelada,
    ).toHaveBeenCalledWith(10, {
      motivo:
        'Solicitação cancelada porque não foi aprovada até o horário da corrida.',
    });
  });

  it('mantém aprovada durante o dia da corrida', async () => {
    const contexto = criarService({
      candidatas: [
        {
          id: 11,
          status: 'A',
          data: DateTime.utc(2026, 10, 24, 12).toJSDate(),
        },
      ],
      atualizadas: 1,
    });

    await expect(contexto.service.executar(agora)).resolves.toEqual([]);
    expect(contexto.updateManySolicitacao).not.toHaveBeenCalled();
  });

  it('cancela aprovada não realizada após o fim do dia local', async () => {
    const depoisDoDia = DateTime.utc(2026, 10, 25, 3);
    const contexto = criarService({
      candidatas: [
        {
          id: 12,
          status: 'A',
          data: DateTime.utc(2026, 10, 24, 12).toJSDate(),
        },
      ],
      atualizadas: 1,
    });

    await expect(contexto.service.executar(depoisDoDia)).resolves.toEqual([
      {
        id: 12,
        motivo:
          'Solicitação aprovada, mas não realizada até o final do dia da corrida.',
      },
    ]);

    expect(contexto.updateManySolicitacao).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nCdSolicitacao: 12,
          cStatus: 'A',
        }),
        data: {
          cStatus: 'C',
          nCdMotivoCancelamento: MOTIVO_CANCELAMENTO_NAO_REALIZADA_ID,
        },
      }),
    );
  });

  it('não notifica quando outra transação já alterou a solicitação', async () => {
    const contexto = criarService({
      candidatas: [{ id: 10, status: 'P', data: agora.toJSDate() }],
      atualizadas: 0,
    });

    await expect(contexto.service.executar(agora)).resolves.toEqual([]);

    expect(contexto.cancelarNotificacoes.execute).not.toHaveBeenCalled();
    expect(
      contexto.notificarSolicitacao.solicitacaoCancelada,
    ).not.toHaveBeenCalled();
  });
});
