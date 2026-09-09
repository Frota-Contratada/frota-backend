import { BuscarSolicitacoesAprovadorController } from './buscar-solicitacoes-aprovador.controller';
import { OrdenacaoSolicitacao } from '../enums/ordenacao-solicitacao.enum';

describe('BuscarSolicitacoesAprovadorController', () => {
  it('usa o usuário autenticado como aprovador da consulta', async () => {
    const service = {
      execute: jest.fn().mockResolvedValue({
        data: [],
        totalCount: 0,
        hasNextPage: false,
      }),
    };
    const controller = new BuscarSolicitacoesAprovadorController(
      service as never,
    );

    await controller.handle(1003, {
      ordenacao: OrdenacaoSolicitacao.RECENTE,
      page: 1,
      limit: 10,
    });

    expect(service.execute).toHaveBeenCalledWith({
      aprovadorId: 1003,
      tipoCorridaId: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      ordenacao: OrdenacaoSolicitacao.RECENTE,
      page: 1,
      limit: 10,
    });
  });
});
