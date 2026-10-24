import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnderecoEncontrado } from '@integration/geocodificacao/interfaces/endereco-encontrado.interface';

export class SugestaoEnderecoDto {
  @ApiProperty({ example: 'Avenida Higienópolis, 100, Centro, Londrina, PR' })
  descricao: string;

  @ApiProperty({ example: -23.3105 })
  latitude: number;

  @ApiProperty({ example: -51.1628 })
  longitude: number;

  @ApiPropertyOptional({ example: 'Avenida Higienópolis' })
  logradouro?: string;

  @ApiPropertyOptional({ example: '100' })
  numero?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  bairro?: string;

  @ApiPropertyOptional({ example: 'Londrina' })
  cidade?: string;

  @ApiPropertyOptional({ example: 'PR' })
  uf?: string;

  @ApiPropertyOptional({ example: '86020080' })
  cep?: string;

  constructor(endereco: EnderecoEncontrado) {
    this.descricao = endereco.descricao;
    this.latitude = endereco.latitude;
    this.longitude = endereco.longitude;
    this.logradouro = endereco.logradouro;
    this.numero = endereco.numero;
    this.bairro = endereco.bairro;
    this.cidade = endereco.cidade;
    this.uf = endereco.uf;
    this.cep = endereco.cep;
  }
}
