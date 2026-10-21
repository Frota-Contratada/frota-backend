import { DateTime } from 'luxon';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoCorrida } from '../domain/tipo-corrida';
import { TipoCorridaEnum } from '../enums/tipo-corrida.enum';
import { CorridaEmergencialNaoAutorizadaException } from '../exceptions/corrida-emergencial-nao-autorizada.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import {
  CriarSolicitacaoInput,
  CriarSolicitacaoService,
} from './criar-solicitacao.service';

describe('CriarSolicitacaoService', () => {
  const endereco = {
    logradouro: 'Rua A',
    cidade: 'Londrina',
    uf: 'PR',
    latitude: -23.3,
    longitude: -51.1,
  };

  const criarService = () => {
    const catalogoRepository = {
      buscarTipoCorrida: jest
        .fn()
        .mockResolvedValue(
          new TipoCorrida(TipoCorridaEnum.EMERGENCIAL, 'Emergencial'),
        ),
      buscarTipoVeiculo: jest.fn().mockResolvedValue(null),
      buscarMotivo: jest.fn().mockResolvedValue(null),
    };

    const service = new CriarSolicitacaoService(
      { existeConflitoDeHorario: jest.fn().mockResolvedValue(false) } as never,
      catalogoRepository as never,
      {
        buscar: jest
          .fn()
          .mockResolvedValue({ id: 1, empresaId: 1, filialId: 1 }),
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return service;
  };

  const input = (perfis: TipoPerfil[]): CriarSolicitacaoInput => ({
    solicitanteId: 1,
    perfisSolicitante: perfis,
    dataCorrida: DateTime.now().plus({ days: 1 }),
    tipoCorridaId: TipoCorridaEnum.EMERGENCIAL,
    motivoSolicitacaoId: 4,
    origem: endereco,
    destino: endereco,
    paradas: [],
    centrosCustoIds: [1],
    cpfsAcompanhantes: [],
    respostasPerguntas: [],
  });

  it('bloqueia corrida emergencial para solicitante sem o perfil de emergência', async () => {
    await expect(
      criarService().execute(input([TipoPerfil.SOLICITANTE])),
    ).rejects.toBeInstanceOf(CorridaEmergencialNaoAutorizadaException);
  });

  it('permite seguir com a corrida emergencial quando o solicitante tem o perfil', async () => {
    await expect(
      criarService().execute(input([TipoPerfil.SOLICITANTE_EMERGENCIA])),
    ).rejects.toBeInstanceOf(MotivoNaoEncontradoException);
  });
});
