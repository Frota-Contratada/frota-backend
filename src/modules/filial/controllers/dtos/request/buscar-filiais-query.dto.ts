import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarFiliaisQuerySchema = z.object({
  nome: z.string().optional(),
  cnpj: z.string().optional(),
});

export class BuscarFiliaisQueryDto extends createZodDto(
  BuscarFiliaisQuerySchema,
) {}
