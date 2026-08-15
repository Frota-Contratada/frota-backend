import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FiltrosFornecedorSchema = z.object({
  nome: z.string().optional(),
  cnpjCpf: z.string().optional(),
});

export const BuscarFornecedoresQuerySchema = FiltrosFornecedorSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarFornecedoresQueryDto extends createZodDto(
  BuscarFornecedoresQuerySchema,
) {}
