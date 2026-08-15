import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarColaboradoresQuerySchema } from './buscar-colaboradores-query.dto';

export const BuscarColaboradoresAdminQuerySchema =
  BuscarColaboradoresQuerySchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
  });

export class BuscarColaboradoresAdminQueryDto extends createZodDto(
  BuscarColaboradoresAdminQuerySchema,
) {}
