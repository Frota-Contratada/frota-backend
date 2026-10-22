import { TipoRegra } from '../enums/tipo-regra.enum';
import { CondicaoRegra } from './condicao-regra';

/**
 * Regra de tarifa de um contrato. O `id` é o nCdRegra, sequencial dentro do
 * contrato. A prioridade determina a ordem de aplicação no motor de regras.
 *
 * Apenas o campo de valor correspondente ao `tipo` é preenchido, exceto a
 * regra de km, que pode ter um valor fixo de saída (bandeirada). Regra sem
 * condição vale para qualquer corrida.
 */
export class Regra {
  constructor(
    public contratoId: number,
    public id: number,
    public prioridade: number,
    public tipo: TipoRegra,
    public condicao: CondicaoRegra | undefined,
    public valorKm?: number,
    public valorFixo?: number,
    public percentual?: number,
  ) {}
}
