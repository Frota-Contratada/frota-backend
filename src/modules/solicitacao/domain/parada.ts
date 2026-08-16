import { Endereco } from './endereco';

export class Parada {
  constructor(
    public ordem: number,
    public endereco: Endereco,
    public tempoParadaMinutos?: number,
  ) {}
}
