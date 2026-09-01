import { ApiProperty } from '@nestjs/swagger';
import { CentroCustoComAprovador } from '../../../services/buscar-centros-custo.service';

export class CentroCustoDto {
  @ApiProperty({ example: 1 })
  filialId: number;

  @ApiProperty({ example: 101 })
  numero: number;

  @ApiProperty({ example: 'Operações' })
  nome: string;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: true })
  temAprovador: boolean;

  constructor(
    filialId: number,
    numero: number,
    nome: string,
    ativo: boolean,
    temAprovador: boolean,
  ) {
    this.filialId = filialId;
    this.numero = numero;
    this.nome = nome;
    this.ativo = ativo;
    this.temAprovador = temAprovador;
  }

  static aPartirDoDominio(item: CentroCustoComAprovador): CentroCustoDto {
    return new CentroCustoDto(
      item.centroCusto.filialId,
      item.centroCusto.id,
      item.centroCusto.nome,
      item.centroCusto.dataDesativacao == null,
      item.temAprovador,
    );
  }
}
