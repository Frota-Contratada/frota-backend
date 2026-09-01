import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Endereco } from '../../../domain/endereco';

export class EnderecoDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Avenida Higienópolis' })
  logradouro: string;

  @ApiProperty({ example: 'Londrina' })
  cidade: string;

  @ApiProperty({ example: 'PR', minLength: 2, maxLength: 2 })
  uf: string;

  @ApiProperty({ example: -23.3103 })
  latitude: number;

  @ApiProperty({ example: -51.1628 })
  longitude: number;

  @ApiProperty({
    description: 'Versão em uma linha, pronta para exibir nas listagens.',
    example: 'Avenida Higienópolis, 1100 - Centro',
  })
  descricao: string;

  @ApiPropertyOptional({
    description: 'Ausente quando o ponto foi marcado no mapa sem numeração.',
    example: '1100',
  })
  numero?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  bairro?: string;

  @ApiPropertyOptional({ example: '86015010' })
  cep?: string;

  @ApiPropertyOptional({ example: 'Sala 302' })
  complemento?: string;

  constructor(endereco: Endereco) {
    this.id = endereco.id;
    this.logradouro = endereco.logradouro;
    this.cidade = endereco.cidade;
    this.uf = endereco.uf;
    this.latitude = endereco.latitude;
    this.longitude = endereco.longitude;
    this.descricao = endereco.descricao;
    this.numero = endereco.numero;
    this.bairro = endereco.bairro;
    this.cep = endereco.cep;
    this.complemento = endereco.complemento;
  }

  static aPartirDoDominio(endereco: Endereco): EnderecoDto {
    return new EnderecoDto(endereco);
  }
}
