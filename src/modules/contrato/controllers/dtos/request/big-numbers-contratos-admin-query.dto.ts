import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { FiltrosContratoSchema } from './buscar-contratos-query.dto';

export const BigNumbersContratosAdminQuerySchema = FiltrosContratoSchema.extend(
  {
    filialId: z.coerce.number().int().positive().optional(),
  },
);

export class BigNumbersContratosAdminQueryDto extends createZodDto(
  BigNumbersContratosAdminQuerySchema,
) {}
