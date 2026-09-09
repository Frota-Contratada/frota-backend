import { Prisma } from '@prisma/client';
import { DiaSemana } from '../../contrato/enums/dia-semana.enum';
import { Periodo } from '../../contrato/enums/periodo.enum';
import { CondicaoRegra, RotaFixaRegra } from '../domain/condicao-regra';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';
import { Regra } from '../domain/regra';

export const INCLUDE_REGRA_PRECIFICACAO = {
  TipoRegra: true,
  CondicaoRegra: {
    include: {
      CondicaoRegraRotaFixa: {
        include: {
          RotaFixa: {
            include: {
              EnderecoOrigem: true,
              EnderecoDestino: true,
            },
          },
        },
      },
      CondicaoRegraOutro: {
        include: { PerguntaContrato: true },
      },
    },
  },
} satisfies Prisma.RegraInclude;

export type PrismaFilialFornecedorComContrato =
  Prisma.FilialFornecedorGetPayload<{
    include: {
      Fornecedor: true;
      Contrato: {
        include: {
          Regra: {
            include: typeof INCLUDE_REGRA_PRECIFICACAO;
          };
        };
      };
    };
  }>;

type PrismaCondicaoRegra = NonNullable<
  PrismaFilialFornecedorComContrato['Contrato']['Regra'][number]['CondicaoRegra']
>;

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
          this.paraCondicao(regra.CondicaoRegra),
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

  private static paraCondicao(
    entity: PrismaCondicaoRegra | null,
  ): CondicaoRegra | undefined {
    if (entity == null || entity.cTipoCondicao !== 'CONDICAO_COMPLETA') {
      return undefined;
    }

    const valor = this.lerValorDaCondicao(entity.cValor);
    const perguntaId = entity.CondicaoRegraOutro?.nCdPergunta.toNumber();
    const rotasFixas = entity.CondicaoRegraRotaFixa.map(
      (vinculo) =>
        new RotaFixaRegra(
          vinculo.nCdRota.toNumber(),
          {
            latitude: vinculo.RotaFixa.EnderecoOrigem.nLatitude.toNumber(),
            longitude: vinculo.RotaFixa.EnderecoOrigem.nLongitude.toNumber(),
          },
          {
            latitude: vinculo.RotaFixa.EnderecoDestino.nLatitude.toNumber(),
            longitude: vinculo.RotaFixa.EnderecoDestino.nLongitude.toNumber(),
          },
        ),
    );

    if (valor == null || perguntaId == null || rotasFixas.length === 0) {
      return undefined;
    }

    return new CondicaoRegra(
      entity.nCdCondicao.toNumber(),
      valor.diasSemana,
      valor.periodos,
      rotasFixas,
      valor.tipoVeiculoIds,
      valor.tipoCorridaIds,
      perguntaId,
    );
  }

  private static lerValorDaCondicao(valor: string):
    | {
        diasSemana: DiaSemana[];
        periodos: Periodo[];
        tipoVeiculoIds: number[];
        tipoCorridaIds: number[];
      }
    | undefined {
    try {
      const parsed: unknown = JSON.parse(valor);
      if (typeof parsed !== 'object' || parsed == null) return undefined;

      const dados = parsed as Record<string, unknown>;
      if (
        dados.aplicaOutroQuando !== 'SIM' ||
        !this.ehListaDeEnum(dados.diasSemana, Object.values(DiaSemana)) ||
        !this.ehListaDeEnum(dados.periodos, Object.values(Periodo)) ||
        !this.ehListaDeIds(dados.tipoVeiculoIds) ||
        !this.ehListaDeIds(dados.tipoCorridaIds)
      ) {
        return undefined;
      }

      return {
        diasSemana: dados.diasSemana as DiaSemana[],
        periodos: dados.periodos as Periodo[],
        tipoVeiculoIds: dados.tipoVeiculoIds,
        tipoCorridaIds: dados.tipoCorridaIds,
      };
    } catch {
      return undefined;
    }
  }

  private static ehListaDeEnum(
    valor: unknown,
    opcoes: readonly string[],
  ): valor is string[] {
    return (
      Array.isArray(valor) &&
      valor.length > 0 &&
      valor.every((item) => typeof item === 'string' && opcoes.includes(item))
    );
  }

  private static ehListaDeIds(valor: unknown): valor is number[] {
    return (
      Array.isArray(valor) &&
      valor.length > 0 &&
      valor.every(
        (item) =>
          typeof item === 'number' && Number.isInteger(item) && item > 0,
      )
    );
  }
}
