export class EnderecoDto {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  latitude: number;
  longitude: number;

  constructor(
    logradouro: string,
    numero: string,
    bairro: string,
    cidade: string,
    uf: string,
    cep: string,
    latitude: number,
    longitude: number,
    complemento?: string,
  ) {
    this.logradouro = logradouro;
    this.numero = numero;
    this.bairro = bairro;
    this.cidade = cidade;
    this.uf = uf;
    this.cep = cep;
    this.latitude = latitude;
    this.longitude = longitude;
    this.complemento = complemento;
  }
}

export class FilialDto {
  id: number;
  nome: string;
  cnpj: string;
  endereco: EnderecoDto;

  constructor(
    id: number,
    nome: string,
    cnpj: string,
    endereco: EnderecoDto,
  ) {
    this.id = id;
    this.nome = nome;
    this.cnpj = cnpj;
    this.endereco = endereco;
  }
}
