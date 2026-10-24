export class ProvedorGeograficoIndisponivelException extends Error {
  constructor(provedor: string) {
    super(`O provedor ${provedor} não respondeu como esperado.`);
    this.name = 'ProvedorGeograficoIndisponivelException';
  }
}
