import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FiltrosCentroCustoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
});

export const BuscarCentrosCustoQuerySchema = FiltrosCentroCustoSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarCentrosCustoQueryDto extends createZodDto(
  BuscarCentrosCustoQuerySchema,
) {}
