import { CondicaoRegra } from './condicao-regra';

export class Regra {
  constructor(
    public contratoId: number,
    public id: number,
    public prioridade: number,
    public tipoRegraId: number,
    public condicoes: CondicaoRegra[] = [],
    public valorFixo?: number,
    public valorKm?: number,
    public percentual?: number,
    public tipoRegraNome?: string,
  ) {}
}
