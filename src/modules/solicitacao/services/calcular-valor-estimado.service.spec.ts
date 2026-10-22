import { DateTime } from 'luxon';
import { DiaSemana } from '../../contrato/enums/dia-semana.enum';
import { Periodo } from '../../contrato/enums/periodo.enum';
import { TIPO_REGRA_ID, TipoRegra } from '../../contrato/enums/tipo-regra.enum';
import { CondicaoRegra } from '../domain/condicao-regra';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';
import { Regra } from '../domain/regra';
import {
  CalcularValorEstimadoService,
  ContextoPrecificacao,
} from './calcular-valor-estimado.service';

const condicaoAberta = (tipoVeiculoIds = [1]) =>
  new CondicaoRegra(
    1,
    Object.values(DiaSemana),
    Object.values(Periodo),
    [],
    tipoVeiculoIds,
    [1],
  );

const regra = (
  id: number,
  prioridade: number,
  tipo: TipoRegra,
  valores: { valorFixo?: number; valorKm?: number; percentual?: number },
  condicao: CondicaoRegra | null = condicaoAberta(),
) =>
  new Regra(
    10,
    id,
    prioridade,
    TIPO_REGRA_ID[tipo],
    condicao ?? undefined,
    valores.valorFixo,
    valores.valorKm,
    valores.percentual,
  );

const contexto: ContextoPrecificacao = {
  distanciaKm: 10,
  // Quarta-feira, 10h (MATUTINO).
  dataCorrida: DateTime.fromISO('2026-10-21T10:00:00'),
  tipoCorridaId: 1,
  tipoVeiculoId: 1,
  quantidadeParadas: 0,
  origem: { latitude: -23.5, longitude: -46.6 },
  destino: { latitude: -23.6, longitude: -46.7 },
  respostasPerguntas: [],
};

describe('CalcularValorEstimadoService', () => {
  const service = new CalcularValorEstimadoService();

  it('ignora a regra de maior prioridade que não se aplica e cobra a primeira válida', () => {
    const contrato = new ContratoPrecificacao(10, 1, 'Fornecedor', [
      regra(1, 1, TipoRegra.VALOR_FIXO, { valorFixo: 50 }, condicaoAberta([2])),
      regra(2, 2, TipoRegra.VALOR_KM, { valorKm: 3 }),
      regra(3, 3, TipoRegra.VALOR_FIXO, { valorFixo: 999 }),
    ]);

    expect(service.avaliar(contrato, contexto)).toEqual({
      valorEstimado: 30,
      rotaFixaId: undefined,
      regrasAplicadas: [{ regraId: 2, valorCobrado: 30 }],
    });
  });

  it('soma acréscimo percentual aplicável sobre a base', () => {
    const contrato = new ContratoPrecificacao(10, 1, 'Fornecedor', [
      regra(1, 1, TipoRegra.VALOR_KM, { valorKm: 2 }),
      regra(2, 2, TipoRegra.PERCENTUAL, { percentual: 25 }),
    ]);

    expect(service.avaliar(contrato, contexto)?.valorEstimado).toBe(25);
  });

  it('não precifica o contrato sem regra de valor aplicável', () => {
    const contrato = new ContratoPrecificacao(10, 1, 'Fornecedor', [
      regra(1, 1, TipoRegra.VALOR_KM, { valorKm: 2 }, condicaoAberta([3])),
      regra(2, 2, TipoRegra.PERCENTUAL, { percentual: 25 }),
    ]);

    expect(service.avaliar(contrato, contexto)).toBeUndefined();
    expect(service.execute(contrato, contexto)).toBe(0);
  });

  it('aplica regra sem condição a qualquer corrida', () => {
    const contrato = new ContratoPrecificacao(10, 1, 'Fornecedor', [
      regra(1, 1, TipoRegra.VALOR_KM, { valorKm: 2 }, null),
    ]);

    expect(
      service.avaliar(contrato, { ...contexto, tipoVeiculoId: undefined })
        ?.valorEstimado,
    ).toBe(20);
  });

  it('trata lista vazia na condição como critério sem restrição', () => {
    const semRestricao = new CondicaoRegra(1, [], [], [], [], []);
    const contrato = new ContratoPrecificacao(10, 1, 'Fornecedor', [
      regra(1, 1, TipoRegra.VALOR_KM, { valorKm: 2 }, semRestricao),
    ]);

    expect(
      service.avaliar(contrato, { ...contexto, tipoVeiculoId: undefined })
        ?.valorEstimado,
    ).toBe(20);
  });

  it('cobra bandeirada e km da mesma regra', () => {
    const contrato = new ContratoPrecificacao(10, 1, 'Fornecedor', [
      regra(1, 1, TipoRegra.VALOR_KM, { valorFixo: 8.5, valorKm: 3 }),
      regra(2, 2, TipoRegra.VALOR_FIXO, { valorFixo: 100 }),
    ]);

    expect(service.avaliar(contrato, contexto)?.valorEstimado).toBe(38.5);
  });
});
