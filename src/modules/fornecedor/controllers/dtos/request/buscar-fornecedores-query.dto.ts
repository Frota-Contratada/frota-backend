import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarFornecedoresQuerySchema = z.object({
  nome: z.string().optional(),
  cnpjCpf: z.string().optional(),
});

export class BuscarFornecedoresQueryDto extends createZodDto(
  BuscarFornecedoresQuerySchema,
) {}
