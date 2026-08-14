import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarFornecedoresQuerySchema = z.object({
  nome: z.string().optional(),
  cnpjCpf: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarFornecedoresQueryDto extends createZodDto(
  BuscarFornecedoresQuerySchema,
) {}
