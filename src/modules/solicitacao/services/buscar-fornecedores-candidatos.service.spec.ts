import { DateTime } from 'luxon';
import { AprovadorNaoAutorizadoException } from '../exceptions/aprovador-nao-autorizado.exception';
import { BuscarFornecedoresCandidatosService } from './buscar-fornecedores-candidatos.service';

describe('BuscarFornecedoresCandidatosService', () => {
  const criarService = () => {
    const solicitacao = {
      solicitanteId: 1002,
      fornecedorId: 20,
      centrosCusto: [{ aprovadorId: 1003 }],
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
    };
    const usuarioRepository = {
      buscar: jest.fn().mockResolvedValue({ empresaId: 30, filialId: 704 }),
    };
    const contratoPrecificacaoRepository = {
      buscarCandidatos: jest.fn().mockResolvedValue([
        { fornecedorId: 10, fornecedorNome: 'Caro', contratoId: 1 },
        { fornecedorId: 20, fornecedorNome: 'Barato', contratoId: 2 },
        { fornecedorId: 30, fornecedorNome: 'Sem regra', contratoId: 3 },
      ]),
    };
    const valores: Record<number, number | undefined> = {
      10: 80,
      20: 40,
      30: undefined,
    };
    const calcularValorEstimadoService = {
      avaliar: jest.fn((contrato: { fornecedorId: number }) => {
        const valor = valores[contrato.fornecedorId];
        return valor == null
          ? undefined
          : { valorEstimado: valor, regrasAplicadas: [] };
      }),
    };
    const service = new BuscarFornecedoresCandidatosService(
      solicitacaoRepository as never,
      usuarioRepository as never,
      contratoPrecificacaoRepository,
      calcularValorEstimadoService as never,
    );

    return { service, contratoPrecificacaoRepository };
  };

  it('lista os fornecedores que precificam a solicitação, do mais barato ao mais caro', async () => {
    const { service, contratoPrecificacaoRepository } = criarService();

    const candidatos = await service.execute(8, 1003);

    expect(
      contratoPrecificacaoRepository.buscarCandidatos,
    ).toHaveBeenCalledWith(30, 704, 1, expect.anything());
    expect(
      candidatos.map((candidato) => [
        candidato.fornecedorId,
        candidato.valorEstimado,
        candidato.selecionado,
      ]),
    ).toEqual([
      [20, 40, true],
      [10, 80, false],
    ]);
  });

  it('rejeita aprovador que não decide nenhum rateio da solicitação', async () => {
    const { service } = criarService();

    await expect(service.execute(8, 9999)).rejects.toBeInstanceOf(
      AprovadorNaoAutorizadoException,
    );
  });
});
