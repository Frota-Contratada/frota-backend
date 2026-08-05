import { Fornecedor as PrismaFornecedor } from '@prisma/client';
import { Fornecedor } from '../domain/fornecedor';
import { DateTime } from 'luxon';

export class PrismaFornecedorMapper {
  static toDomain(entity: PrismaFornecedor): Fornecedor;
  static toDomain(entity: PrismaFornecedor | null): Fornecedor | null;
  static toDomain(entity: PrismaFornecedor | null): Fornecedor | null {
    if (entity == null) return null;

    return new Fornecedor(
      entity.cNmFornecedor,
      entity.cCNPJCPF,
      DateTime.fromJSDate(entity.dAtivacao),
      entity.nCdFornecedor.toNumber(),
      entity.cCaminhoArquivo ?? undefined,
      entity.dDesativacao == null
        ? undefined
        : DateTime.fromJSDate(entity.dDesativacao),
    );
  }
}
