import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarVeiculosQuerySchema = z.object({
  fornecedorId: z.coerce.number().int().positive().optional(),
  placa: z
    .string()
    .transform((valor) => valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    .optional(),
  ativo: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(100),
});

export class BuscarVeiculosQueryDto extends createZodDto(
  BuscarVeiculosQuerySchema,
) {}

export const BuscarVeiculoQuerySchema = z.object({
  fornecedorId: z.coerce.number().int().positive().optional(),
});

export class BuscarVeiculoQueryDto extends createZodDto(
  BuscarVeiculoQuerySchema,
) {}
