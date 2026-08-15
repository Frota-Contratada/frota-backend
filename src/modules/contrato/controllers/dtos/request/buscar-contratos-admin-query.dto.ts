import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarContratosQuerySchema } from './buscar-contratos-query.dto';

export const BuscarContratosAdminQuerySchema =
  BuscarContratosQuerySchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
  });

export class BuscarContratosAdminQueryDto extends createZodDto(
  BuscarContratosAdminQuerySchema,
) {}
