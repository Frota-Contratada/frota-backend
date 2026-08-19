export class Endereco {
  constructor(
    public logradouro: string,
    public cidade: string,
    public uf: string,
    public latitude: number,
    public longitude: number,
    public id: number = 0,
    public numero?: string,
    public bairro?: string,
    public cep?: string,
    public complemento?: string,
  ) {}

  get descricao(): string {
    const inicio = this.numero
      ? `${this.logradouro}, ${this.numero}`
      : this.logradouro;

    return this.bairro ? `${inicio} - ${this.bairro}` : inicio;
  }
}
