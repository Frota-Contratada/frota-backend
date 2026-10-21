export interface EnderecoEncontrado {
  descricao: string;
  latitude: number;
  longitude: number;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface PontoGeografico {
  latitude: number;
  longitude: number;
}
