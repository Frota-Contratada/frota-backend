import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { dataIsoSchema } from './data-iso.schema';

export const EnderecoRequestSchema = z.object({
  logradouro: z
    .string()
    .trim()
    .min(1, { message: 'Informe o logradouro' })
    .max(200),
  cidade: z.string().trim().min(1, { message: 'Informe a cidade' }).max(100),
  uf: z
    .string()
    .trim()
    .length(2, { message: 'Informe a UF com 2 caracteres' })
    .transform((valor) => valor.toUpperCase()),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  numero: z.string().trim().min(1).max(20).optional(),
  bairro: z.string().trim().min(1).max(100).optional(),
  cep: z.string().trim().min(1).max(10).optional(),
  complemento: z.string().trim().min(1).max(100).optional(),
});

export const CriarSolicitacaoRequestSchema = z.object({
  dataCorrida: dataIsoSchema(
    'Informe a data da corrida em formato ISO 8601 válido',
  ),
  tipoCorridaId: z.number().int().positive(),
  tipoVeiculoId: z.number().int().positive().optional(),
  motivoSolicitacaoId: z.number().int().positive(),
  origem: EnderecoRequestSchema,
  destino: EnderecoRequestSchema,
  paradas: z.array(EnderecoRequestSchema).max(10).default([]),
  centrosCustoIds: z
    .array(z.number().int().positive())
    .min(1, { message: 'Informe ao menos um centro de custo' })
    .max(10),
  cpfsAcompanhantes: z
    .array(z.string().trim().length(11, { message: 'CPF deve ter 11 dígitos' }))
    .max(10)
    .default([]),
});

export class CriarSolicitacaoRequestDto extends createZodDto(
  CriarSolicitacaoRequestSchema,
) {}
