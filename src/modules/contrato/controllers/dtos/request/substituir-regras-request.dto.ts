import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { DiaSemana } from '../../../enums/dia-semana.enum';
import { Periodo } from '../../../enums/periodo.enum';
import { TipoRegra } from '../../../enums/tipo-regra.enum';

const idSchema = z.number().int().positive();

const enderecoSchema = z.object({
  logradouro: z.string().trim().min(1).max(200),
  numero: z.string().trim().min(1).max(20),
  complemento: z.string().trim().max(100).optional(),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.string().trim().length(2).toUpperCase(),
  cep: z.string().trim().min(1).max(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Critério omitido ou lista vazia não restringe a regra. */
export const CondicaoRegraRequestSchema = z.object({
  diasSemana: z.array(z.enum(DiaSemana)).default([]),
  periodos: z.array(z.enum(Periodo)).default([]),
  rotasFixas: z
    .array(
      z.object({
        origem: enderecoSchema,
        destino: enderecoSchema,
      }),
    )
    .default([]),
  tipoVeiculoIds: z.array(idSchema).default([]),
  tipoCorridaIds: z.array(idSchema).default([]),
  outro: z
    .object({
      pergunta: z.string().trim().min(1).max(255),
    })
    .optional(),
});

const CAMPO_VALOR_POR_TIPO_REGRA = {
  [TipoRegra.VALOR_KM]: 'valorKm',
  [TipoRegra.VALOR_FIXO]: 'valorFixo',
  [TipoRegra.PERCENTUAL]: 'percentual',
  // Valor por hora de espera.
  [TipoRegra.TEMPO_ESPERA]: 'valorFixo',
} as const;

/** Campos aceitos além do obrigatório: a regra de km aceita bandeirada. */
const CAMPOS_OPCIONAIS_POR_TIPO_REGRA: Record<TipoRegra, readonly string[]> = {
  [TipoRegra.VALOR_KM]: ['valorFixo'],
  [TipoRegra.VALOR_FIXO]: [],
  [TipoRegra.PERCENTUAL]: [],
  [TipoRegra.TEMPO_ESPERA]: [],
};

const CAMPOS_DE_VALOR = ['valorKm', 'valorFixo', 'percentual'] as const;

export const RegraRequestSchema = z
  .object({
    prioridade: z.number().int().positive(),
    tipo: z.enum(TipoRegra),
    valorKm: z.number().nonnegative().optional(),
    valorFixo: z.number().nonnegative().optional(),
    percentual: z.number().positive().max(999.99).optional(),
    condicao: CondicaoRegraRequestSchema.optional(),
  })
  .superRefine((regra, ctx) => {
    const campoEsperado = CAMPO_VALOR_POR_TIPO_REGRA[regra.tipo];
    const camposOpcionais = CAMPOS_OPCIONAIS_POR_TIPO_REGRA[regra.tipo];

    for (const campo of CAMPOS_DE_VALOR) {
      const preenchido = regra[campo] !== undefined;

      if (campo === campoEsperado && !preenchido) {
        ctx.addIssue({
          code: 'custom',
          path: [campo],
          message: `Regra do tipo "${regra.tipo}" exige o campo "${campo}".`,
        });
      }

      if (
        campo !== campoEsperado &&
        !camposOpcionais.includes(campo) &&
        preenchido
      ) {
        ctx.addIssue({
          code: 'custom',
          path: [campo],
          message: `Regra do tipo "${regra.tipo}" não aceita o campo "${campo}".`,
        });
      }
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

export type RegraRequest = z.infer<typeof RegraRequestSchema>;

export class SubstituirRegrasRequestDto extends createZodDto(
  SubstituirRegrasRequestSchema,
) {}
