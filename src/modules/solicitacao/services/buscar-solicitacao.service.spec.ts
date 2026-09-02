import { BuscarSolicitacaoService } from './buscar-solicitacao.service';
import { SolicitacaoDeOutroSolicitanteException } from '../exceptions/solicitacao-de-outro-solicitante.exception';

describe('BuscarSolicitacaoService', () => {
  const criarService = () => {
    const solicitacao = {
      solicitanteId: 1002,
      centrosCusto: [{ aprovadorId: 1003 }],
      distanciaEstimadaKm: 12,
      duracaoEstimadaMinutos: undefined,
    };
    const repository = {
      buscar: jest.fn().mockResolvedValue(solicitacao),
    };
    const rotaService = {
      estimarDuracaoMinutos: jest.fn().mockReturnValue(24),
    };
    const service = new BuscarSolicitacaoService(
      repository as never,
      rotaService as never,
    );

    return { service, solicitacao };
  };

  it('permite que o solicitante consulte a própria solicitação', async () => {
    const { service, solicitacao } = criarService();

    await expect(service.execute(8, 1002)).resolves.toBe(solicitacao);
  });

  it('permite que o aprovador vinculado consulte a solicitação', async () => {
    const { service, solicitacao } = criarService();

    await expect(service.execute(8, 1003)).resolves.toBe(solicitacao);
  });

  it('rejeita um usuário que não seja solicitante nem aprovador', async () => {
    const { service } = criarService();

    await expect(service.execute(8, 9999)).rejects.toBeInstanceOf(
      SolicitacaoDeOutroSolicitanteException,
    );
  });
});
