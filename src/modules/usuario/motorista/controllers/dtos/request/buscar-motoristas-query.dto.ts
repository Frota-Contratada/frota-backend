import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarMotoristasQuerySchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
});

export class BuscarMotoristasQueryDto extends createZodDto(
  BuscarMotoristasQuerySchema,
) {}
