import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarCorridasQuerySchema = z.object({
  status: z.enum(['A', 'I', 'F', 'C']).optional(),
  dataInicio: z.string().datetime({ offset: true }).optional(),
  dataFim: z.string().datetime({ offset: true }).optional(),
});

export class BuscarCorridasQueryDto extends createZodDto(
  BuscarCorridasQuerySchema,
) {}
