import { DateTime } from 'luxon';
import { StatusCorrida } from '../enums/status-corrida.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { CorridaSolicitacao } from './corrida-solicitacao';
import { Endereco } from './endereco';
import { Motivo } from './motivo';
import { Solicitacao } from './solicitacao';
import { TipoCorrida } from './tipo-corrida';

const endereco = new Endereco('Rua A', 'Londrina', 'PR', -23.3, -51.1, 1);

const criarSolicitacao = (
  status: StatusSolicitacao,
  statusCorrida?: StatusCorrida,
): Solicitacao =>
  new Solicitacao(
    30,
    1,
    1,
    new TipoCorrida(1, 'Táxi'),
    DateTime.fromISO('2026-10-28T12:00:00.000-03:00'),
    endereco,
    endereco,
    new Motivo(1, 'Viagem a trabalho', TipoMotivo.SOLICITACAO),
    10,
    35,
    {
      id: 2,
      status,
      corrida:
        statusCorrida == null
          ? undefined
          : new CorridaSolicitacao(
              7,
              statusCorrida,
              DateTime.fromISO('2026-10-28T12:00:00.000-03:00'),
              8,
              0,
              0,
              'ABC1D23',
            ),
    },
  );

describe('Solicitacao.cancelavel', () => {
  it.each([
    [StatusSolicitacao.PENDENTE, undefined],
    [StatusSolicitacao.APROVADA, undefined],
    [StatusSolicitacao.APROVADA, StatusCorrida.AGENDADA],
    [StatusSolicitacao.APROVADA, StatusCorrida.CANCELADA],
  ])('permite cancelar com status %s e corrida %s', (status, corrida) => {
    expect(criarSolicitacao(status, corrida).cancelavel).toBe(true);
  });

  it.each([
    [StatusSolicitacao.APROVADA, StatusCorrida.INICIADA],
    [StatusSolicitacao.APROVADA, StatusCorrida.FINALIZADA],
    [StatusSolicitacao.CANCELADA, undefined],
    [StatusSolicitacao.REPROVADA, undefined],
  ])('impede cancelar com status %s e corrida %s', (status, corrida) => {
    expect(criarSolicitacao(status, corrida).cancelavel).toBe(false);
  });
});
