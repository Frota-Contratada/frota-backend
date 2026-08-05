export class Endereco {
  constructor(
    public logradouro: string,
    public numero: string,
    public bairro: string,
    public cidade: string,
    public uf: string,
    public cep: string,
    public latitude: number,
    public longitude: number,
    public id: number = 0,
    public complemento?: string,
  ) {}
}
