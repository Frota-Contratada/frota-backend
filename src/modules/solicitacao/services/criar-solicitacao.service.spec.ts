import { DateTime } from 'luxon';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Solicitacao } from '../domain/solicitacao';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { TipoCorridaEnum } from '../enums/tipo-corrida.enum';
import { BeneficiarioInvalidoException } from '../exceptions/beneficiario-invalido.exception';
import { CorridaEmergencialNaoAutorizadaException } from '../exceptions/corrida-emergencial-nao-autorizada.exception';
import {
  CriarSolicitacaoInput,
  CriarSolicitacaoService,
} from './criar-solicitacao.service';

describe('CriarSolicitacaoService', () => {
  const endereco = {
    logradouro: 'Rua A',
    cidade: 'Rolândia',
    uf: 'PR',
    latitude: -23.31,
    longitude: -51.36,
  };
  const usuarios: Record<number, unknown> = {
    1002: {
      id: 1002,
      nome: 'Solicitante',
      cpf: '11111111111',
      empresaId: 30,
      filialId: 704,
    },
    1003: {
      id: 1003,
      nome: 'Aprovador',
      cpf: '33333333333',
      empresaId: 30,
      filialId: 704,
    },
    2001: {
      id: 2001,
      nome: 'Colega',
      cpf: '22222222222',
      empresaId: 30,
      filialId: 704,
    },
    2002: {
      id: 2002,
      nome: 'Outra filial',
      cpf: '4',
      empresaId: 30,
      filialId: 1,
    },
    2003: { id: 2003, nome: 'Sem CPF', empresaId: 30, filialId: 704 },
  };

  const criarService = (tipoCorrida = { id: 1, nome: 'Táxi' }) => {
    const solicitacaoRepository = {
      existeConflitoDeHorario: jest.fn().mockResolvedValue(false),
      criar: jest.fn((solicitacao: Solicitacao) =>
        Promise.resolve(Object.assign(solicitacao, { id: 77 })),
      ),
      aprovarTodosOsRateios: jest.fn().mockResolvedValue({ id: 77 }),
    };
    const notificarSolicitacao = {
      solicitacaoCriada: jest.fn(),
      solicitacaoAguardandoFornecedor: jest.fn(),
    };
    const service = new CriarSolicitacaoService(
      solicitacaoRepository as never,
      {
        buscarTipoCorrida: jest.fn().mockResolvedValue(tipoCorrida),
        buscarMotivo: jest.fn().mockResolvedValue({
          id: 9001,
          nome: 'Viagem de trabalho',
          tipo: TipoMotivo.SOLICITACAO,
        }),
      } as never,
      {
        buscar: jest.fn((id: number) => Promise.resolve(usuarios[id] ?? null)),
      } as never,
      { buscarPorCpfs: jest.fn().mockResolvedValue([]) } as never,
      {
        buscar: jest
          .fn()
          .mockResolvedValue({ nome: 'CC 4704', dataDesativacao: null }),
        buscarAprovadorId: jest.fn().mockResolvedValue(1003),
      } as never,
      {
        calcular: jest
          .fn()
          .mockResolvedValue({ distanciaKm: 10, duracaoMinutos: 12 }),
      } as never,
      {
        execute: jest.fn().mockResolvedValue({
          fornecedorId: 864,
          fornecedorNome: 'Transportes',
          contratoId: 9001,
          valorEstimado: 38.5,
        }),
      } as never,
      notificarSolicitacao as never,
    );

    return { service, solicitacaoRepository, notificarSolicitacao };
  };

  const input = (
    solicitanteId: number,
    perfis: TipoPerfil[],
    beneficiarioId?: number,
  ): CriarSolicitacaoInput => ({
    solicitanteId,
    perfis,
    beneficiarioId,
    dataCorrida: DateTime.now().plus({ days: 1 }),
    tipoCorridaId: 1,
    motivoSolicitacaoId: 9001,
    origem: endereco,
    destino: { ...endereco, latitude: -23.4 },
    paradas: [],
    centrosCustoIds: [4704],
    cpfsAcompanhantes: [],
    respostasPerguntas: [],
  });

  const passageirosCriados = (repositorio: {
    criar: jest.Mock<Promise<Solicitacao>, [Solicitacao]>;
  }) =>
    repositorio.criar.mock.calls[0][0].passageiros.map(
      (passageiro) => passageiro.cpf,
    );

  const emergencial = { id: TipoCorridaEnum.EMERGENCIAL, nome: 'Emergencial' };

  it('recusa corrida emergencial de quem não é solicitante de emergência', async () => {
    const { service, solicitacaoRepository } = criarService(emergencial);

    await expect(
      service.execute(input(1002, [TipoPerfil.SOLICITANTE])),
    ).rejects.toBeInstanceOf(CorridaEmergencialNaoAutorizadaException);
    expect(solicitacaoRepository.criar).not.toHaveBeenCalled();
  });

  it('aceita corrida emergencial do solicitante de emergência', async () => {
    const { service, solicitacaoRepository } = criarService(emergencial);

    await service.execute(input(1002, [TipoPerfil.SOLICITANTE_EMERGENCIA]));

    expect(solicitacaoRepository.criar).toHaveBeenCalled();
  });

  it('usa o beneficiário como passageiro principal', async () => {
    const { service, solicitacaoRepository } = criarService();

    await service.execute(input(1002, [TipoPerfil.SOLICITANTE], 2001));

    expect(passageirosCriados(solicitacaoRepository)).toEqual(['22222222222']);
  });

  it('mantém o solicitante como passageiro quando não há beneficiário', async () => {
    const { service, solicitacaoRepository, notificarSolicitacao } =
      criarService();

    await service.execute(input(1002, [TipoPerfil.SOLICITANTE]));

    expect(passageirosCriados(solicitacaoRepository)).toEqual(['11111111111']);
    expect(solicitacaoRepository.aprovarTodosOsRateios).not.toHaveBeenCalled();
    expect(notificarSolicitacao.solicitacaoCriada).toHaveBeenCalledWith(77);
  });

  it.each([
    ['de outra filial', 2002],
    ['sem CPF', 2003],
    ['inexistente', 9999],
  ])('recusa beneficiário %s', async (_descricao, beneficiarioId) => {
    const { service } = criarService();

    await expect(
      service.execute(input(1002, [TipoPerfil.SOLICITANTE], beneficiarioId)),
    ).rejects.toBeInstanceOf(BeneficiarioInvalidoException);
  });

  it('aprova direto a solicitação criada pelo aprovador de todo o rateio', async () => {
    const { service, solicitacaoRepository, notificarSolicitacao } =
      criarService();

    await service.execute(input(1003, [TipoPerfil.APROVADOR], 2001));

    expect(solicitacaoRepository.aprovarTodosOsRateios).toHaveBeenCalledWith(
      77,
    );
    expect(
      notificarSolicitacao.solicitacaoAguardandoFornecedor,
    ).toHaveBeenCalledWith(77);
    expect(notificarSolicitacao.solicitacaoCriada).not.toHaveBeenCalled();
  });
});
