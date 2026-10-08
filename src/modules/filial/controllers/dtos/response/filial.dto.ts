import { Filial } from '../../../domain/filial';

export class EnderecoDto {
  tipoLogradouro?: string;
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
    tipoLogradouro?: string,
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
    this.tipoLogradouro = tipoLogradouro;
  }
}

export class FilialDto {
  empresaId: number;
  id: number;
  nome: string;
  cnpj: string;
  endereco: EnderecoDto;

  constructor(
    empresaId: number,
    id: number,
    nome: string,
    cnpj: string,
    endereco: EnderecoDto,
  ) {
    this.empresaId = empresaId;
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
      filial.endereco.tipoLogradouro,
    );

    return new FilialDto(
      filial.empresaId,
      filial.id,
      filial.nome,
      filial.cnpj,
      endereco,
    );
  }
}
