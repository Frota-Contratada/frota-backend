import { Filial } from '../../../domain/filial';

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

  constructor(id: number, nome: string, cnpj: string, endereco: EnderecoDto) {
    this.id = id;
    this.nome = nome;
    this.cnpj = cnpj;
    this.endereco = endereco;
  }

  static aPartirDoDominio(filial: Filial): FilialDto {
    const endereco = new EnderecoDto(
      filial.endereco.logradouro,
      filial.endereco.numero,
      filial.endereco.bairro,
      filial.endereco.cidade,
      filial.endereco.uf,
      filial.endereco.cep,
      filial.endereco.latitude,
      filial.endereco.longitude,
      filial.endereco.complemento,
    );

    return new FilialDto(filial.id, filial.nome, filial.cnpj, endereco);
  }
}
