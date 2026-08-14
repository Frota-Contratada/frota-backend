import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarVariasFiliaisQuerySchema = z.object({
  nome: z.string().trim().min(1).optional(),
  cnpj: z.string().trim().min(1).optional(),
  endereco: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarVariasFiliaisQueryDto extends createZodDto(
  BuscarVariasFiliaisQuerySchema,
) {}
