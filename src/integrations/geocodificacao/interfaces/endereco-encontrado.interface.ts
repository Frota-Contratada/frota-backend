export interface PontoGeografico {
  latitude: number;
  longitude: number;
}

export interface EnderecoEncontrado extends PontoGeografico {
  descricao: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}
