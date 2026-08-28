import { DateTime } from 'luxon';
import { CorridaSolicitacao } from '../../../domain/corrida-solicitacao';
import { Endereco } from '../../../domain/endereco';
import { Motivo } from '../../../domain/motivo';
import { Solicitacao } from '../../../domain/solicitacao';
import { TipoCorrida } from '../../../domain/tipo-corrida';
import { StatusCorrida } from '../../../enums/status-corrida.enum';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';
import { StatusViagem } from '../../../enums/status-viagem.enum';
import { ViagemAgendadaDto } from './viagem-agendada.dto';

const criarSolicitacao = (comCorrida: boolean): Solicitacao =>
  new Solicitacao(
    30,
    1,
    new TipoCorrida(1, 'Táxi'),
    DateTime.fromISO('2026-08-28T12:00:00.000-03:00'),
    new Endereco('Rua A', 'São Paulo', 'SP', -23.55, -46.63),
    new Endereco('Rua B', 'São Paulo', 'SP', -23.56, -46.64),
    new Motivo(1, 'Viagem a trabalho', TipoMotivo.SOLICITACAO),
    10,
    35,
    {
      id: 2,
      corrida: comCorrida
        ? new CorridaSolicitacao(
            1,
            StatusCorrida.INICIADA,
            DateTime.fromISO('2026-08-28T12:00:00.000-03:00'),
            10,
            0,
            35,
            'ABC1D23',
            'Motorista',
          )
        : undefined,
    },
  );

describe('ViagemAgendadaDto', () => {
  it('devolve o ID real da corrida iniciada sem reutilizar solicitacaoId', () => {
    const dto = ViagemAgendadaDto.aPartirDoDominio(criarSolicitacao(true));

    expect(dto).toMatchObject({
      solicitacaoId: 2,
      corridaId: '1',
      status: StatusViagem.EM_ANDAMENTO,
    });
    expect(dto.corridaId).not.toBe(String(dto.solicitacaoId));
  });

  it('omite corridaId enquanto não existir corrida', () => {
    const dto = ViagemAgendadaDto.aPartirDoDominio(criarSolicitacao(false));

    expect(dto.corridaId).toBeUndefined();
    expect(JSON.parse(JSON.stringify(dto))).not.toHaveProperty('corridaId');
  });
});
