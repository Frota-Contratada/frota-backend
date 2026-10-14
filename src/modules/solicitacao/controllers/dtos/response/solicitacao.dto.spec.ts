import { DateTime } from 'luxon';
import { Endereco } from '../../../domain/endereco';
import { Motivo } from '../../../domain/motivo';
import { Solicitacao } from '../../../domain/solicitacao';
import { TipoCorrida } from '../../../domain/tipo-corrida';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';
import { SolicitacaoDto } from './solicitacao.dto';

const criarSolicitacao = (origem: Endereco, destino: Endereco): Solicitacao =>
  new Solicitacao(
    30,
    1,
    1,
    new TipoCorrida(1, 'Táxi'),
    DateTime.fromISO('2026-08-28T12:00:00.000-03:00'),
    origem,
    destino,
    new Motivo(1, 'Viagem a trabalho', TipoMotivo.SOLICITACAO),
    10,
    35,
    { id: 2 },
  );

describe('SolicitacaoDto', () => {
  it('expõe o local de partida e o de destino em uma linha', () => {
    const dto = SolicitacaoDto.aPartirDoDominio(
      criarSolicitacao(
        new Endereco(
          'Avenida Higienópolis',
          'Londrina',
          'PR',
          -23.3103,
          -51.1628,
          1,
          '1100',
          'Centro',
        ),
        new Endereco(
          'Avenida Santos Dumont',
          'Londrina',
          'PR',
          -23.3335,
          -51.1301,
          3,
          '100',
          'Aeroporto',
        ),
      ),
    );

    expect(dto.localPartida).toBe('Avenida Higienópolis, 1100 - Centro');
    expect(dto.localDestino).toBe('Avenida Santos Dumont, 100 - Aeroporto');
  });

  it('mantém os endereços completos ao lado dos campos de texto', () => {
    const dto = SolicitacaoDto.aPartirDoDominio(
      criarSolicitacao(
        new Endereco(
          'Avenida Higienópolis',
          'Londrina',
          'PR',
          -23.3103,
          -51.1628,
          1,
          '1100',
          'Centro',
        ),
        new Endereco(
          'Avenida Santos Dumont',
          'Londrina',
          'PR',
          -23.3335,
          -51.1301,
          3,
          '100',
          'Aeroporto',
        ),
      ),
    );

    expect(dto.localPartida).toBe(dto.origem.descricao);
    expect(dto.localDestino).toBe(dto.destino.descricao);
    expect(dto.origem.latitude).toBe(-23.3103);
    expect(dto.destino.longitude).toBe(-51.1301);
  });

  it('cai para o logradouro quando o ponto não tem número nem bairro', () => {
    const dto = SolicitacaoDto.aPartirDoDominio(
      criarSolicitacao(
        new Endereco('Rodovia Mábio Gonçalves', 'Londrina', 'PR', -23.3, -51.1),
        new Endereco('Estrada da Mata', 'Londrina', 'PR', -23.4, -51.2),
      ),
    );

    expect(dto.localPartida).toBe('Rodovia Mábio Gonçalves');
    expect(dto.localDestino).toBe('Estrada da Mata');
  });
});
