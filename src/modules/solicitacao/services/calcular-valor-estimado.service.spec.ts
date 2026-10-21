import { DateTime } from 'luxon';
import { DiaSemana } from '../../contrato/enums/dia-semana.enum';
import { Periodo } from '../../contrato/enums/periodo.enum';
import { CondicaoRegra } from '../domain/condicao-regra';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';
import { Regra } from '../domain/regra';
import {
  CalcularValorEstimadoService,
  ContextoPrecificacao,
} from './calcular-valor-estimado.service';

describe('CalcularValorEstimadoService', () => {
  const service = new CalcularValorEstimadoService();

  const condicao = (tipoVeiculoIds: number[]) =>
    new CondicaoRegra(
      1,
      Object.values(DiaSemana),
      Object.values(Periodo),
      [],
      tipoVeiculoIds,
      [1],
    );

  const contrato = (tipoVeiculoIds: number[]) =>
    new ContratoPrecificacao(1, 1, 'Fornecedor', [
      new Regra(1, 1, 1, 2, condicao(tipoVeiculoIds), 10),
      new Regra(1, 2, 2, 1, condicao(tipoVeiculoIds), undefined, 2),
    ]);

  const contexto: ContextoPrecificacao = {
    distanciaKm: 5,
    dataCorrida: DateTime.fromISO('2026-10-20T09:30:00.000-03:00'),
    tipoCorridaId: 1,
    tipoVeiculoId: 2,
    quantidadeParadas: 0,
    origem: { latitude: -23.3, longitude: -51.1 },
    destino: { latitude: -23.32, longitude: -51.15 },
    respostasPerguntas: [],
  };

  it('soma as regras aplicáveis do contrato', () => {
    expect(service.avaliar(contrato([2]), contexto)?.valorEstimado).toBe(20);
  });

  it('não precifica o contrato quando nenhuma regra se aplica', () => {
    expect(service.avaliar(contrato([3]), contexto)).toBeUndefined();
    expect(service.execute(contrato([3]), contexto)).toBe(0);
  });
});
