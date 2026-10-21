import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { Veiculo } from '../domain/veiculo';

export const INCLUDE_VEICULO = {
  TipoVeiculo: true,
  Fornecedor: { select: { cNmFornecedor: true } },
} satisfies Prisma.VeiculoInclude;

export type PrismaVeiculoCompleto = Prisma.VeiculoGetPayload<{
  include: typeof INCLUDE_VEICULO;
}>;

export class PrismaVeiculoMapper {
  static toDomain(entity: PrismaVeiculoCompleto): Veiculo;
  static toDomain(entity: PrismaVeiculoCompleto | null): Veiculo | null;
  static toDomain(entity: PrismaVeiculoCompleto | null): Veiculo | null {
    if (entity == null) return null;

    return new Veiculo(
      entity.nCdVeiculo.toNumber(),
      entity.nCdFornecedor.toNumber(),
      entity.nCdTpVeiculo.toNumber(),
      entity.cPlaca,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.cModelo ?? undefined,
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
      entity.TipoVeiculo.cNmTpVeiculo,
      entity.TipoVeiculo.iQntPassageiros,
      entity.Fornecedor.cNmFornecedor,
    );
  }
}
