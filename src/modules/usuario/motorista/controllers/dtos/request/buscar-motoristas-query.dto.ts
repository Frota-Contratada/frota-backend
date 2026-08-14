import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarMotoristasQuerySchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarMotoristasQueryDto extends createZodDto(
  BuscarMotoristasQuerySchema,
) {}
