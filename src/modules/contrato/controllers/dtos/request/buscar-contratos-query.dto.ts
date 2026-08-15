import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FiltrosContratoSchema = z.object({
  fornecedorId: z.coerce.number().int().positive().optional(),
  vigenciaDe: z.string().date().pipe(z.coerce.date()).optional(),
  vigenciaAte: z.string().date().pipe(z.coerce.date()).optional(),
});

export const BuscarContratosQuerySchema = FiltrosContratoSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarContratosQueryDto extends createZodDto(
  BuscarContratosQuerySchema,
) {}
