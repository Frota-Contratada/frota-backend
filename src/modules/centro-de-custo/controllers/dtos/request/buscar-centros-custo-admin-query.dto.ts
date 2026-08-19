import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarCentrosCustoQuerySchema } from './buscar-centros-custo-query.dto';

export const BuscarCentrosCustoAdminQuerySchema =
  BuscarCentrosCustoQuerySchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
  });

export class BuscarCentrosCustoAdminQueryDto extends createZodDto(
  BuscarCentrosCustoAdminQuerySchema,
) {}
