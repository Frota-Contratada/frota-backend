import { AgendamentoNotificacao } from '../domain/notificacao';
import { AgendarLembreteDaSolicitacaoService } from './agendar-lembrete-da-solicitacao.service';

describe('AgendarLembreteDaSolicitacaoService', () => {
  const criarService = () => {
    const configService = { get: jest.fn().mockReturnValue(undefined) };
    const repository = {
      salvarAgendamento: jest.fn().mockResolvedValue(undefined),
      cancelarAgendamento: jest.fn().mockResolvedValue(null),
    };
    const queue = { enfileirar: jest.fn().mockResolvedValue(undefined) };
    const cancelarNotificacoes = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const service = new AgendarLembreteDaSolicitacaoService(
      configService as never,
      repository as never,
      queue as never,
      cancelarNotificacoes as never,
    );

    return { service, repository, queue, cancelarNotificacoes };
  };

  const agendamentosSalvos = (repository: {
    salvarAgendamento: jest.Mock;
  }): AgendamentoNotificacao[] =>
    repository.salvarAgendamento.mock.calls.map(
      ([agendamento]: [AgendamentoNotificacao]) => agendamento,
    );

  const daquiA = (minutos: number) => new Date(Date.now() + minutos * 60_000);

  it('agenda os dois lembretes com os destinatários de cada um', async () => {
    const { service, repository } = criarService();

    await service.execute({
      solicitacaoId: 10,
      dataCorrida: daquiA(300),
      destinatarioIds: [1, 6],
      destinatariosLembreteFinal: [6, 5],
    });

    const salvos = agendamentosSalvos(repository);
    expect(salvos).toHaveLength(2);
    expect(salvos[0].notificacoes.map((n) => n.usuarioId)).toEqual([1, 6]);
    expect(salvos[1].notificacoes.map((n) => n.usuarioId)).toEqual([6, 5]);
  });

  it('dispara o lembrete final 10 minutos antes da corrida', async () => {
    const { service, repository } = criarService();
    const dataCorrida = daquiA(300);

    await service.execute({
      solicitacaoId: 10,
      dataCorrida,
      destinatarioIds: [1],
      destinatariosLembreteFinal: [6],
    });

    const [previo, final] = agendamentosSalvos(repository);
    expect(Date.parse(previo.dispararEm)).toBe(
      dataCorrida.getTime() - 120 * 60_000,
    );
    expect(Date.parse(final.dispararEm)).toBe(
      dataCorrida.getTime() - 10 * 60_000,
    );
  });

  it('usa o texto de viagem iminente no lembrete final', async () => {
    const { service, repository } = criarService();

    await service.execute({
      solicitacaoId: 10,
      dataCorrida: daquiA(300),
      destinatarioIds: [1],
      destinatariosLembreteFinal: [6],
    });

    const [, final] = agendamentosSalvos(repository);
    expect(final.notificacoes[0].mensagem).toContain('começa em 10 minutos');
  });

  it('pula o lembrete prévio quando a corrida é marcada em cima da hora', async () => {
    const { service, repository } = criarService();

    await service.execute({
      solicitacaoId: 10,
      dataCorrida: daquiA(30),
      destinatarioIds: [1],
      destinatariosLembreteFinal: [6],
    });

    const salvos = agendamentosSalvos(repository);
    expect(salvos).toHaveLength(1);
    expect(salvos[0].notificacoes[0].mensagem).toContain(
      'começa em 10 minutos',
    );
  });

  it('não agenda nada para uma corrida que já passou', async () => {
    const { service, repository } = criarService();

    await service.execute({
      solicitacaoId: 10,
      dataCorrida: daquiA(-60),
      destinatarioIds: [1],
      destinatariosLembreteFinal: [6],
    });

    expect(repository.salvarAgendamento).not.toHaveBeenCalled();
  });

  it('limpa os lembretes pendentes antes de reagendar', async () => {
    const { service, cancelarNotificacoes } = criarService();

    await service.execute({
      solicitacaoId: 10,
      dataCorrida: daquiA(300),
      destinatarioIds: [1],
      destinatariosLembreteFinal: [6],
    });

    expect(cancelarNotificacoes.execute).toHaveBeenCalledWith(10);
  });
});
