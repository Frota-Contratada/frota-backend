import { TipoRegra } from '../enums/tipo-regra.enum';
import { CondicaoRegra } from './condicao-regra';

/**
 * Regra de tarifa de um contrato. O `id` é o nCdRegra, sequencial dentro do
 * contrato. A prioridade determina a ordem de aplicação no motor de regras.
 *
 * Apenas o campo de valor correspondente ao `tipo` é preenchido; os outros
 * ficam indefinidos. Cada regra possui uma condição completa obrigatória.
 */
export class Regra {
  constructor(
    public contratoId: number,
    public id: number,
    public prioridade: number,
    public tipo: TipoRegra,
    public condicao: CondicaoRegra,
    public valorKm?: number,
    public valorFixo?: number,
    public percentual?: number,
  ) {}
}
