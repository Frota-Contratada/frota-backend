import { ApiProperty } from '@nestjs/swagger';
import {
  CategoriaNotificacao,
  PreferenciasNotificacao,
} from '../../../domain/preferencias-notificacao';

export class PreferenciasNotificacaoDto {
  @ApiProperty({ example: true })
  pushAtivo: boolean;

  @ApiProperty({
    type: 'object',
    properties: Object.fromEntries(
      Object.values(CategoriaNotificacao).map((categoria) => [
        categoria,
        { type: 'boolean', example: true },
      ]),
    ),
  })
  categorias: Record<CategoriaNotificacao, boolean>;

  @ApiProperty({ format: 'date-time', nullable: true, type: String })
  atualizadoEm: string | null;

  constructor(preferencias: PreferenciasNotificacao) {
    this.pushAtivo = preferencias.pushAtivo;
    this.categorias = preferencias.categorias;
    this.atualizadoEm = preferencias.atualizadoEm?.toISOString() ?? null;
  }
}
