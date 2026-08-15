import {
  Contrato as PrismaContrato,
  FilialFornecedor as PrismaFilialFornecedor,
  Fornecedor as PrismaFornecedor,
} from '@prisma/client';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorSummary } from '../domain/types/fornecedor-summary.type';
import { DateTime } from 'luxon';

type PrismaVinculoComContrato = Pick<PrismaFilialFornecedor, 'nCdFilial'> & {
  Filial: { cNmFilial: string };
  Contrato: PrismaContrato;
};

type PrismaFornecedorComSummary = PrismaFornecedor & {
  _count: { Veiculo: number };
  FilialFornecedor: PrismaVinculoComContrato[];
};

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

  static toSummary(entity: PrismaFornecedorComSummary): FornecedorSummary {
    return {
      id: entity.nCdFornecedor.toNumber(),
      nome: entity.cNmFornecedor,
      cnpjCpf: entity.cCNPJCPF,
      dataAtivacao: DateTime.fromJSDate(entity.dAtivacao),
      ativo: entity.dDesativacao == null,
      quantidadeVeiculosAtivos: entity._count.Veiculo,
      contratosVigentes: entity.FilialFornecedor.map((vinculo) => ({
        contratoId: vinculo.Contrato.nCdContrato.toNumber(),
        filialId: vinculo.nCdFilial.toNumber(),
        filialNome: vinculo.Filial.cNmFilial,
        dataVigenciaInicio: DateTime.fromJSDate(
          vinculo.Contrato.dVigenciaInicio,
        ),
        dataVigenciaFim:
          vinculo.Contrato.dVigenciaFim == null
            ? undefined
            : DateTime.fromJSDate(vinculo.Contrato.dVigenciaFim),
        dataAlteracao: DateTime.fromJSDate(vinculo.Contrato.dAlteracao),
      })),
    };
  }
}
