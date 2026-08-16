import { Prisma } from '@prisma/client';
import { CondicaoRegra } from '../domain/condicao-regra';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';
import { Regra } from '../domain/regra';

export type PrismaFilialFornecedorComContrato =
  Prisma.FilialFornecedorGetPayload<{
    include: {
      Fornecedor: true;
      Contrato: {
        include: {
          Regra: {
            include: { CondicaoRegra: true; TipoRegra: true };
          };
        };
      };
    };
  }>;

export class PrismaContratoPrecificacaoMapper {
  static toDomain(
    entity: PrismaFilialFornecedorComContrato,
  ): ContratoPrecificacao {
    const regras = entity.Contrato.Regra.map(
      (regra) =>
        new Regra(
          regra.nCdContrato.toNumber(),
          regra.nCdRegra.toNumber(),
          regra.iPrioridade,
          regra.nCdTipoRegra.toNumber(),
          regra.CondicaoRegra.map(
            (condicao) =>
              new CondicaoRegra(
                condicao.nCdCondicao.toNumber(),
                condicao.cTipoCondicao,
                condicao.cValor,
              ),
          ),
          regra.nValorFixo == null ? undefined : regra.nValorFixo.toNumber(),
          regra.nValorKm == null ? undefined : regra.nValorKm.toNumber(),
          regra.nPercentual == null ? undefined : regra.nPercentual.toNumber(),
          regra.TipoRegra.cNmRegra,
        ),
    );

    return new ContratoPrecificacao(
      entity.nCdContrato.toNumber(),
      entity.nCdFornecedor.toNumber(),
      entity.Fornecedor.cNmFornecedor,
      regras,
    );
  }
}
