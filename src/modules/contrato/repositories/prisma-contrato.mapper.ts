import { Contrato as PrismaContrato, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { Contrato } from '../domain/contrato';
import { ContratoSummary } from '../domain/types/contrato-summary.type';
import { StatusContrato } from '../enums/status-contrato.enum';

export const CONTRATO_VINCULO_SELECT = {
  nCdFilial: true,
  nCdFornecedor: true,
  Filial: { select: { cNmFilial: true } },
  Fornecedor: { select: { cNmFornecedor: true } },
} satisfies Prisma.FilialFornecedorSelect;

export type PrismaContratoComVinculos = Prisma.ContratoGetPayload<{
  include: { FilialFornecedor: { select: typeof CONTRATO_VINCULO_SELECT } };
}>;

export class PrismaContratoMapper {
  static toDomain(entity: PrismaContrato): Contrato;
  static toDomain(entity: PrismaContrato | null): Contrato | null;
  static toDomain(entity: PrismaContrato | null): Contrato | null {
    if (entity == null) return null;

    return new Contrato(
      entity.nCdContrato.toNumber(),
      entity.cCaminhoArquivo,
      entity.nCdUsuarioCadastro.toNumber(),
      DateTime.fromJSDate(entity.dVigenciaInicio),
      entity.dVigenciaFim == null
        ? undefined
        : DateTime.fromJSDate(entity.dVigenciaFim),
      DateTime.fromJSDate(entity.dAlteracao),
    );
  }

  static toSummary(
    entity: PrismaContratoComVinculos,
    hoje: DateTime,
    limiteVenceEmBreve: DateTime,
  ): ContratoSummary {
    const dataVigenciaInicio = DateTime.fromJSDate(entity.dVigenciaInicio);
    const dataVigenciaFim =
      entity.dVigenciaFim == null
        ? undefined
        : DateTime.fromJSDate(entity.dVigenciaFim);

    return {
      id: entity.nCdContrato.toNumber(),
      dataVigenciaInicio,
      dataVigenciaFim,
      status: PrismaContratoMapper.calcularStatus(
        dataVigenciaInicio,
        dataVigenciaFim,
        hoje,
        limiteVenceEmBreve,
      ),
      vinculos: entity.FilialFornecedor.map((vinculo) => ({
        filialId: vinculo.nCdFilial.toNumber(),
        filialNome: vinculo.Filial.cNmFilial,
        fornecedorId: vinculo.nCdFornecedor.toNumber(),
        fornecedorNome: vinculo.Fornecedor.cNmFornecedor,
      })),
    };
  }

  private static calcularStatus(
    inicio: DateTime,
    fim: DateTime | undefined,
    hoje: DateTime,
    limiteVenceEmBreve: DateTime,
  ): StatusContrato {
    if (fim !== undefined && fim < hoje) {
      return StatusContrato.VENCIDO;
    }

    if (inicio > hoje) {
      return StatusContrato.AGENDADO;
    }

    if (fim !== undefined && fim <= limiteVenceEmBreve) {
      return StatusContrato.VENCE_EM_BREVE;
    }

    return StatusContrato.VIGENTE;
  }
}
