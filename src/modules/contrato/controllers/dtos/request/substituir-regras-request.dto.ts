import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { DiaSemana } from '../../../enums/dia-semana.enum';
import { Periodo } from '../../../enums/periodo.enum';
import { TipoCondicao } from '../../../enums/tipo-condicao.enum';
import { TipoRegra } from '../../../enums/tipo-regra.enum';

const idSchema = z.number().int().positive();

export const CondicaoRegraRequestSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal(TipoCondicao.DIAS_SEMANA),
    diasSemana: z.array(z.enum(DiaSemana)).min(1),
  }),
  z.object({
    tipo: z.literal(TipoCondicao.PERIODO),
    periodos: z.array(z.enum(Periodo)).min(1),
  }),
  z.object({
    tipo: z.literal(TipoCondicao.ROTA_FIXA),
    rotaFixaIds: z.array(idSchema).min(1),
  }),
  z.object({
    tipo: z.literal(TipoCondicao.TIPO_VEICULO),
    tipoVeiculoIds: z.array(idSchema).min(1),
  }),
  z.object({
    tipo: z.literal(TipoCondicao.TIPO_CORRIDA),
    tipoCorridaIds: z.array(idSchema).min(1),
  }),
  z.object({
    tipo: z.literal(TipoCondicao.OUTRO),
    perguntaId: idSchema,
  }),
]);

const CAMPO_VALOR_POR_TIPO_REGRA = {
  [TipoRegra.VALOR_KM]: 'valorKm',
  [TipoRegra.VALOR_FIXO]: 'valorFixo',
  [TipoRegra.PERCENTUAL]: 'percentual',
} as const;

const CAMPOS_DE_VALOR = ['valorKm', 'valorFixo', 'percentual'] as const;

export const RegraRequestSchema = z
  .object({
    prioridade: z.number().int().positive(),
    tipo: z.enum(TipoRegra),
    valorKm: z.number().nonnegative().optional(),
    valorFixo: z.number().nonnegative().optional(),
    percentual: z.number().positive().max(999.99).optional(),
    condicoes: z.array(CondicaoRegraRequestSchema).default([]),
  })
  .superRefine((regra, ctx) => {
    const campoEsperado = CAMPO_VALOR_POR_TIPO_REGRA[regra.tipo];

    for (const campo of CAMPOS_DE_VALOR) {
      const preenchido = regra[campo] !== undefined;

      if (campo === campoEsperado && !preenchido) {
        ctx.addIssue({
          code: 'custom',
          path: [campo],
          message: `Regra do tipo "${regra.tipo}" exige o campo "${campo}".`,
        });
      }

      if (campo !== campoEsperado && preenchido) {
        ctx.addIssue({
          code: 'custom',
          path: [campo],
          message: `Regra do tipo "${regra.tipo}" não aceita o campo "${campo}".`,
        });
      }
    }

    const tiposDeCondicao = regra.condicoes.map((condicao) => condicao.tipo);
    const tiposDuplicados = tiposDeCondicao.filter(
      (tipo, indice) => tiposDeCondicao.indexOf(tipo) !== indice,
    );

    for (const tipo of new Set(tiposDuplicados)) {
      ctx.addIssue({
        code: 'custom',
        path: ['condicoes'],
        message: `A regra tem mais de uma condição do tipo "${tipo}".`,
      });
    }
  });

export const SubstituirRegrasRequestSchema = z
  .object({
    regras: z.array(RegraRequestSchema),
  })
  .superRefine((body, ctx) => {
    const prioridades = body.regras.map((regra) => regra.prioridade);
    const duplicadas = prioridades.filter(
      (prioridade, indice) => prioridades.indexOf(prioridade) !== indice,
    );

    for (const prioridade of new Set(duplicadas)) {
      ctx.addIssue({
        code: 'custom',
        path: ['regras'],
        message: `Mais de uma regra com a prioridade ${prioridade}.`,
      });
    }
  });

export class SubstituirRegrasRequestDto extends createZodDto(
  SubstituirRegrasRequestSchema,
) {}
