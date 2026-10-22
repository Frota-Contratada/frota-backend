import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Veiculo } from '../../../domain/veiculo';

export class VeiculoDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'ABC1D23' }) placa: string;
  @ApiPropertyOptional({ example: 'Spin' }) modelo?: string;
  @ApiProperty({ example: 2 }) tipoVeiculoId: number;
  @ApiPropertyOptional({ example: 'Carro' }) tipoVeiculoNome?: string;
  @ApiPropertyOptional({ example: 4 }) capacidadePassageiros?: number;
  @ApiProperty({ example: 864 }) fornecedorId: number;
  @ApiPropertyOptional({ example: 'Transportes Aurora' })
  fornecedorNome?: string;
  @ApiProperty({ format: 'date-time' }) dataAtivacao: string;
  @ApiProperty({ example: true }) ativo: boolean;

  constructor(veiculo: Veiculo) {
    this.id = veiculo.id;
    this.placa = veiculo.placa;
    this.modelo = veiculo.modelo;
    this.tipoVeiculoId = veiculo.tipoVeiculoId;
    this.tipoVeiculoNome = veiculo.tipoVeiculoNome;
    this.capacidadePassageiros = veiculo.capacidadePassageiros;
    this.fornecedorId = veiculo.fornecedorId;
    this.fornecedorNome = veiculo.fornecedorNome;
    this.dataAtivacao = veiculo.dataAtivacao.toISO() ?? '';
    this.ativo = veiculo.ativo;
  }

  static aPartirDoDominio(veiculo: Veiculo): VeiculoDto {
    return new VeiculoDto(veiculo);
  }
}
