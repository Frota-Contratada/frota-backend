import { NotificacaoConteudo } from '../domain/notificacao';
import { NotificarSolicitacaoService } from './notificar-solicitacao.service';

describe('NotificarSolicitacaoService', () => {
  const envolvidos = {
    solicitacaoId: 10,
    dataCorrida: new Date('2026-10-20T12:00:00.000Z'),
    solicitanteId: 1,
    solicitanteNome: 'Karina',
    aprovadorIds: [2, 3],
    fornecedorIds: [4],
    passageiroIds: [1, 5],
    motoristaId: 6,
    corridaId: 99,
    placaVeiculo: 'ABC1234',
  };

  const criarService = () => {
    const resolverEnvolvidos = {
      execute: jest.fn().mockResolvedValue(envolvidos),
    };
    const enviarNotificacao = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const agendarLembrete = { execute: jest.fn().mockResolvedValue(undefined) };
    const service = new NotificarSolicitacaoService(
      resolverEnvolvidos as never,
      enviarNotificacao as never,
      agendarLembrete as never,
    );

    return { service, resolverEnvolvidos, enviarNotificacao, agendarLembrete };
  };

  const destinatariosDoEnvio = (enviarNotificacao: {
    execute: jest.Mock;
  }): number[] => {
    const [, notificacoes] = enviarNotificacao.execute.mock.calls[0] as [
      number,
      NotificacaoConteudo[],
    ];

    return notificacoes.map((notificacao) => notificacao.usuarioId);
  };

  it('avisa só os aprovadores quando a solicitação é criada', async () => {
    const { service, enviarNotificacao } = criarService();

    await service.solicitacaoCriada(10);

    expect(destinatariosDoEnvio(enviarNotificacao)).toEqual([2, 3]);
  });

  it('avisa só o fornecedor quando a solicitação é aprovada', async () => {
    const { service, enviarNotificacao } = criarService();

    await service.solicitacaoAguardandoFornecedor(10);

    expect(destinatariosDoEnvio(enviarNotificacao)).toEqual([4]);
  });

  it('avisa solicitante e motorista quando a solicitação vira corrida', async () => {
    const { service, enviarNotificacao } = criarService();

    await service.solicitacaoVirouCorrida(10);

    expect(destinatariosDoEnvio(enviarNotificacao)).toEqual([1, 6]);
  });

  it('avisa todos os envolvidos no cancelamento, menos quem cancelou', async () => {
    const { service, enviarNotificacao } = criarService();

    await service.solicitacaoCancelada(10, { canceladaPorId: 1 });

    expect(destinatariosDoEnvio(enviarNotificacao)).toEqual([2, 3, 4, 5, 6]);
  });

  it('avisa todos os envolvidos quando o fornecedor recusa', async () => {
    const { service, enviarNotificacao } = criarService();

    await service.solicitacaoRecusadaPeloFornecedor(10, 'Sem motorista');

    expect(destinatariosDoEnvio(enviarNotificacao)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('inclui o motivo na mensagem da recusa', async () => {
    const { service, enviarNotificacao } = criarService();

    await service.solicitacaoRecusadaPeloFornecedor(10, 'Sem motorista');

    const [, notificacoes] = enviarNotificacao.execute.mock.calls[0] as [
      number,
      NotificacaoConteudo[],
    ];
    expect(notificacoes[0].mensagem).toContain('Motivo: Sem motorista.');
  });

  it('busca a corrida mesmo cancelada ao notificar o cancelamento dela', async () => {
    const { service, resolverEnvolvidos } = criarService();

    await service.corridaCancelada(10, { canceladaPorId: 6 });

    expect(resolverEnvolvidos.execute).toHaveBeenCalledWith(10, {
      incluirCorridasCanceladas: true,
    });
  });

  it('agenda o lembrete prévio para solicitante e motorista e o final para motorista e passageiros', async () => {
    const { service, agendarLembrete } = criarService();

    await service.agendarLembretesDaCorrida(10);

    expect(agendarLembrete.execute).toHaveBeenCalledWith({
      solicitacaoId: 10,
      dataCorrida: envolvidos.dataCorrida,
      destinatarioIds: [1, 6],
      destinatariosLembreteFinal: [6, 1, 5],
    });
  });

  it('não derruba a operação de negócio quando a entrega falha', async () => {
    const { service, enviarNotificacao } = criarService();
    enviarNotificacao.execute.mockRejectedValue(new Error('redis fora do ar'));

    await expect(service.solicitacaoCriada(10)).resolves.toBeUndefined();
  });

  it('não envia nada quando a solicitação não existe', async () => {
    const { service, resolverEnvolvidos, enviarNotificacao } = criarService();
    resolverEnvolvidos.execute.mockResolvedValue(null);

    await service.solicitacaoCriada(10);

    expect(enviarNotificacao.execute).not.toHaveBeenCalled();
  });
});
