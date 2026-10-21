import { ApiProperty } from '@nestjs/swagger';
import { FornecedorCandidato } from '../../../domain/fornecedor-candidato';

export class FornecedorCandidatoDto {
  @ApiProperty({ example: 864 })
  fornecedorId: number;

  @ApiProperty({ example: 'Transportes Aurora' })
  fornecedorNome: string;

  @ApiProperty({ example: 9001 })
  contratoId: number;

  @ApiProperty({
    description: 'Valor estimado pelas regras do contrato vigente.',
    example: 43.32,
  })
  valorEstimado: number;

  @ApiProperty({
    description: 'Fornecedor gravado na solicitação.',
    example: true,
  })
  selecionado: boolean;

  constructor(candidato: FornecedorCandidato) {
    this.fornecedorId = candidato.fornecedorId;
    this.fornecedorNome = candidato.fornecedorNome;
    this.contratoId = candidato.contratoId;
    this.valorEstimado = candidato.valorEstimado;
    this.selecionado = candidato.selecionado;
  }

  static aPartirDoDominio(
    candidato: FornecedorCandidato,
  ): FornecedorCandidatoDto {
    return new FornecedorCandidatoDto(candidato);
  }
}
