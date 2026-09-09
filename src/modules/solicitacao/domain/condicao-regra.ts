import { DiaSemana } from '../../contrato/enums/dia-semana.enum';
import { Periodo } from '../../contrato/enums/periodo.enum';

export interface PontoDaRotaFixa {
  latitude: number;
  longitude: number;
}

export class RotaFixaRegra {
  constructor(
    public id: number,
    public origem: PontoDaRotaFixa,
    public destino: PontoDaRotaFixa,
  ) {}
}

/**
 * Condição completa de uma regra de contrato. Os critérios são combinados com
 * AND; as listas internas representam alternativas (OR).
 */
export class CondicaoRegra {
  constructor(
    public id: number,
    public diasSemana: DiaSemana[],
    public periodos: Periodo[],
    public rotasFixas: RotaFixaRegra[],
    public tipoVeiculoIds: number[],
    public tipoCorridaIds: number[],
    public perguntaId: number,
  ) {}
}
