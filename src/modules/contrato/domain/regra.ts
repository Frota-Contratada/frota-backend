import { TipoRegra } from '../enums/tipo-regra.enum';
import { CondicaoRegra } from './condicao-regra';

/**
 * Regra de tarifa de um contrato. O `id` é o nCdRegra, sequencial dentro do
 * contrato. Quanto maior a `prioridade`, mais forte a regra.
 *
 * Apenas o campo de valor correspondente ao `tipo` é preenchido; os outros dois
 * ficam indefinidos.
 *
 * Uma regra sem condições casa com qualquer corrida.
 */
export class Regra {
  constructor(
    public contratoId: number,
    public id: number,
    public prioridade: number,
    public tipo: TipoRegra,
    public condicoes: CondicaoRegra[] = [],
    public valorKm?: number,
    public valorFixo?: number,
    public percentual?: number,
  ) {}
}
