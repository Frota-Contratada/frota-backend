import {
  Motivo as PrismaMotivo,
  TipoCorrida as PrismaTipoCorrida,
  TipoVeiculo as PrismaTipoVeiculo,
} from '@prisma/client';
import { Motivo } from '../domain/motivo';
import { TipoCorrida } from '../domain/tipo-corrida';
import { TipoVeiculo } from '../domain/tipo-veiculo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export class PrismaCatalogoSolicitacaoMapper {
  static motivoToDomain(entity: PrismaMotivo): Motivo;
  static motivoToDomain(entity: PrismaMotivo | null): Motivo | null;
  static motivoToDomain(entity: PrismaMotivo | null): Motivo | null {
    if (entity == null) return null;

    return new Motivo(
      entity.nCdMotivo.toNumber(),
      entity.cNmMotivo,
      PrismaCatalogoSolicitacaoMapper.paraTipoMotivo(entity.cTipoMotivo),
    );
  }

  static tipoCorridaToDomain(entity: PrismaTipoCorrida): TipoCorrida;
  static tipoCorridaToDomain(
    entity: PrismaTipoCorrida | null,
  ): TipoCorrida | null;
  static tipoCorridaToDomain(
    entity: PrismaTipoCorrida | null,
  ): TipoCorrida | null {
    if (entity == null) return null;

    return new TipoCorrida(
      entity.nCdTipoCorrida.toNumber(),
      entity.cNmTipoCorrida,
    );
  }

  static tipoVeiculoToDomain(entity: PrismaTipoVeiculo): TipoVeiculo;
  static tipoVeiculoToDomain(
    entity: PrismaTipoVeiculo | null,
  ): TipoVeiculo | null;
  static tipoVeiculoToDomain(
    entity: PrismaTipoVeiculo | null,
  ): TipoVeiculo | null {
    if (entity == null) return null;

    return new TipoVeiculo(
      entity.nCdTpVeiculo.toNumber(),
      entity.cNmTpVeiculo,
      entity.iQntVeiculo,
    );
  }

  private static paraTipoMotivo(valor: string): TipoMotivo {
    const tipos = Object.values(TipoMotivo) as string[];

    return tipos.includes(valor)
      ? (valor as TipoMotivo)
      : TipoMotivo.SOLICITACAO;
  }
}
