import { OrdenacaoSolicitacao } from '../enums/ordenacao-solicitacao.enum';
import { StatusAprovacao } from '../enums/status-aprovacao.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { PrismaSolicitacaoRepository } from './prisma-solicitacao.repository';

describe('PrismaSolicitacaoRepository', () => {
  it('filtra somente rateios pendentes atribuídos ao aprovador autenticado', async () => {
    const prismaService = {
      solicitacao: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const repository = new PrismaSolicitacaoRepository(prismaService as never);

    await repository.buscarPendentesParaAprovacao({
      aprovadorId: 1003,
      ordenacao: OrdenacaoSolicitacao.RECENTE,
      page: 1,
      limit: 10,
    });

    expect(prismaService.solicitacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          cStatus: StatusSolicitacao.PENDENTE,
          SolicitacaoCentroCusto: {
            some: {
              nCdAprovador: 1003,
              cStatusAprovacao: StatusAprovacao.PENDENTE,
            },
          },
        },
      }),
    );
  });
});
