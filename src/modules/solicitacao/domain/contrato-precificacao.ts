import { Regra } from './regra';

export class ContratoPrecificacao {
  constructor(
    public contratoId: number,
    public fornecedorId: number,
    public fornecedorNome: string,
    public regras: Regra[] = [],
  ) {}
}
