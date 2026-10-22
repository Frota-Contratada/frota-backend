import { ApiProperty } from '@nestjs/swagger';
import { ColaboradorSummary } from '../../../domain/types/colaborador-summary.type';

export class BeneficiarioDto {
  @ApiProperty({ example: 1203 })
  id: number;

  @ApiProperty({ example: 'Maria Souza' })
  nome: string;

  constructor(colaborador: ColaboradorSummary) {
    this.id = colaborador.id;
    this.nome = colaborador.nome;
  }

  static aPartirDoDominio(colaborador: ColaboradorSummary): BeneficiarioDto {
    return new BeneficiarioDto(colaborador);
  }
}
