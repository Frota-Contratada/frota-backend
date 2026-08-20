import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Motivo } from '../../../domain/motivo';
import { TipoCorrida } from '../../../domain/tipo-corrida';
import { TipoVeiculo } from '../../../domain/tipo-veiculo';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';

export class CatalogoItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Viagem de trabalho' })
  nome: string;

  @ApiPropertyOptional({
    description:
      'Preenchido apenas nos motivos, para separar as listas no app. Ver TipoMotivo.',
    enum: TipoMotivo,
    example: TipoMotivo.SOLICITACAO,
  })
  tipo?: string;

  @ApiPropertyOptional({
    example: 4,
  })
  capacidadePassageiros?: number;

  constructor(
    id: number,
    nome: string,
    tipo?: string,
    capacidadePassageiros?: number,
  ) {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo;
    this.capacidadePassageiros = capacidadePassageiros;
  }

  static aPartirDoMotivo(motivo: Motivo): CatalogoItemDto {
    return new CatalogoItemDto(motivo.id, motivo.nome, motivo.tipo);
  }

  static aPartirDoTipoCorrida(tipoCorrida: TipoCorrida): CatalogoItemDto {
    return new CatalogoItemDto(tipoCorrida.id, tipoCorrida.nome);
  }

  static aPartirDoTipoVeiculo(tipoVeiculo: TipoVeiculo): CatalogoItemDto {
    return new CatalogoItemDto(
      tipoVeiculo.id,
      tipoVeiculo.nome,
      undefined,
      tipoVeiculo.capacidadePassageiros,
    );
  }
}
