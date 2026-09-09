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

export const CondicaoRegraRequestSchema = z.object({
  diasSemana: z.array(z.enum(DiaSemana)).min(1),
  periodos: z.array(z.enum(Periodo)).min(1),
  rotasFixas: z
    .array(
      z.object({
        origem: enderecoSchema,
        destino: enderecoSchema,
      }),
    )
    .min(1),
  tipoVeiculoIds: z.array(idSchema).min(1),
  tipoCorridaIds: z.array(idSchema).min(1),
  outro: z.object({
    pergunta: z.string().trim().min(1).max(255),
  }),
});

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
    condicao: CondicaoRegraRequestSchema,
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
