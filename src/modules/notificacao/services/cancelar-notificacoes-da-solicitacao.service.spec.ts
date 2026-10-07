import { StatusAgendamentoNotificacao } from '../domain/notificacao';
import { CancelarNotificacoesDaSolicitacaoService } from './cancelar-notificacoes-da-solicitacao.service';

describe('CancelarNotificacoesDaSolicitacaoService', () => {
  const entregue = {
    id: 'ag-entregue',
    jobId: 'job-entregue',
    status: StatusAgendamentoNotificacao.ENTREGUE,
    notificacoes: [{ id: 'n-entregue', usuarioId: 1 }],
  };
  const agendada = {
    id: 'ag-agendada',
    jobId: 'job-agendada',
    status: StatusAgendamentoNotificacao.AGENDADA,
    notificacoes: [{ id: 'n-agendada', usuarioId: 2 }],
  };

  const criarService = () => {
    const repository = {
      listarAgendamentosDaSolicitacao: jest
        .fn()
        .mockResolvedValue([entregue, agendada]),
      cancelarAgendamento: jest.fn((id: string) =>
        Promise.resolve(
          id === agendada.id
            ? { ...agendada, status: StatusAgendamentoNotificacao.CANCELADA }
            : null,
        ),
      ),
      removerNotificacoesDoAgendamento: jest.fn().mockResolvedValue(undefined),
    };
    const queue = { cancelar: jest.fn().mockResolvedValue(undefined) };
    const events = { publicarRemovida: jest.fn() };
    const service = new CancelarNotificacoesDaSolicitacaoService(
      repository as never,
      queue as never,
      events as never,
    );

    return { service, repository, queue, events };
  };

  it('preserva o que já foi entregue ao usuário', async () => {
    const { service, repository, events } = criarService();

    await service.execute(10);

    expect(repository.cancelarAgendamento).not.toHaveBeenCalledWith(
      entregue.id,
    );
    expect(events.publicarRemovida).not.toHaveBeenCalledWith(1, 'n-entregue');
  });

  it('cancela o agendamento que ainda não disparou e tira o job da fila', async () => {
    const { service, repository, queue } = criarService();

    await service.execute(10);

    expect(repository.cancelarAgendamento).toHaveBeenCalledWith(agendada.id);
    expect(queue.cancelar).toHaveBeenCalledWith(agendada.jobId);
  });

  it('avisa o usuário de que a notificação pendente sumiu', async () => {
    const { service, events } = criarService();

    await service.execute(10);

    expect(events.publicarRemovida).toHaveBeenCalledTimes(1);
    expect(events.publicarRemovida).toHaveBeenCalledWith(2, 'n-agendada');
  });
});
