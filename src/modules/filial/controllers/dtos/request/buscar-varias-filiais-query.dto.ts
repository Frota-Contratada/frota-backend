import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarVariasFiliaisQuerySchema = z.object({
  nome: z.string().trim().min(1).optional(),
  cnpj: z.string().trim().min(1).optional(),
  endereco: z.string().trim().min(1).optional(),
});

export class BuscarVariasFiliaisQueryDto extends createZodDto(
  BuscarVariasFiliaisQuerySchema,
) {}
