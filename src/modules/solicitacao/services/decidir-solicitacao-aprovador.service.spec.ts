import { DateTime } from 'luxon';
import { Prisma } from '@prisma/client';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { AprovadorNaoAutorizadoException } from '../exceptions/aprovador-nao-autorizado.exception';
import { FornecedorIndisponivelException } from '../exceptions/fornecedor-indisponivel.exception';
import { DecidirSolicitacaoAprovadorService } from './decidir-solicitacao-aprovador.service';

const decimal = (valor: number) => new Prisma.Decimal(valor);

describe('DecidirSolicitacaoAprovadorService', () => {
  const criarService = (candidatos = [{ fornecedorId: 20, contratoId: 2 }]) => {
    const solicitacao = {
      id: 8,
      solicitanteId: 1002,
      fornecedorId: 20,
      centrosCusto: [
        {
          aprovadorId: 1003,
          empresaId: 30,
          filialId: 704,
          centroCustoId: 4704,
        },
      ],
      distanciaEstimadaKm: 10,
      dataCorrida: DateTime.fromISO('2026-10-21T10:00:00.000-03:00'),
      tipoCorrida: { id: 1 },
      tipoVeiculo: undefined,
      paradas: [],
      origem: { latitude: -23.3, longitude: -51.1 },
      destino: { latitude: -23.4, longitude: -51.2 },
      respostasPerguntas: [],
    };
    const solicitacaoRepository = {
      buscar: jest.fn().mockResolvedValue(solicitacao),
      decidirPeloAprovador: jest
        .fn()
        .mockResolvedValue({ status: StatusSolicitacao.APROVADA }),
    };
    const contratoPrecificacaoRepository = {
      buscarCandidatos: jest.fn().mockResolvedValue(candidatos),
    };
    const calcularValorEstimadoService = {
      avaliar: jest.fn().mockReturnValue({ valorEstimado: 38.5 }),
    };
    const prismaService = {
      usuario: {
        findUnique: jest.fn().mockResolvedValue({
          nCdEmpresa: decimal(30),
          nCdFilial: decimal(704),
          nCdCentroCusto: decimal(4704),
        }),
      },
    };
    const notificarSolicitacao = {
      solicitacaoAguardandoFornecedor: jest.fn(),
    };
    const service = new DecidirSolicitacaoAprovadorService(
      solicitacaoRepository as never,
      {} as never,
      contratoPrecificacaoRepository,
      calcularValorEstimadoService as never,
      prismaService as never,
      notificarSolicitacao as never,
    );

    return { service, solicitacaoRepository, notificarSolicitacao };
  };

  it('aprova sem fornecedor informado mantendo o fornecedor da criação', async () => {
    const { service, solicitacaoRepository, notificarSolicitacao } =
      criarService();

    await service.execute(8, 1003, { decisao: 'APROVAR' });

    expect(solicitacaoRepository.decidirPeloAprovador).toHaveBeenCalledWith(
      8,
      1003,
      expect.objectContaining({
        fornecedorId: 20,
        contratoId: 2,
        valorEstimado: 38.5,
      }),
    );
    expect(
      notificarSolicitacao.solicitacaoAguardandoFornecedor,
    ).toHaveBeenCalledWith(8);
  });

  it('usa o fornecedor escolhido pelo aprovador quando informado', async () => {
    const { service, solicitacaoRepository } = criarService([
      { fornecedorId: 20, contratoId: 2 },
      { fornecedorId: 10, contratoId: 1 },
    ]);

    await service.execute(8, 1003, { decisao: 'APROVAR', fornecedorId: 10 });

    expect(solicitacaoRepository.decidirPeloAprovador).toHaveBeenCalledWith(
      8,
      1003,
      expect.objectContaining({ fornecedorId: 10, contratoId: 1 }),
    );
  });

  it('recusa quando o fornecedor da criação não tem mais contrato vigente', async () => {
    const { service } = criarService([]);

    await expect(
      service.execute(8, 1003, { decisao: 'APROVAR' }),
    ).rejects.toBeInstanceOf(FornecedorIndisponivelException);
  });

  it('impede aprovador de outro centro de custo de escolher fornecedor', async () => {
    const { service } = criarService();

    await expect(
      service.execute(8, 9999, { decisao: 'APROVAR', fornecedorId: 10 }),
    ).rejects.toBeInstanceOf(AprovadorNaoAutorizadoException);
  });
});
