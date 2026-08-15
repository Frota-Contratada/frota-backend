import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { FiltrosColaboradorSchema } from './buscar-colaboradores-query.dto';

export const BigNumbersColaboradoresAdminQuerySchema =
  FiltrosColaboradorSchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
  });

export class BigNumbersColaboradoresAdminQueryDto extends createZodDto(
  BigNumbersColaboradoresAdminQuerySchema,
) {}
