import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { FiltrosFornecedorSchema } from './buscar-fornecedores-query.dto';

export const BigNumbersFornecedoresAdminQuerySchema =
  FiltrosFornecedorSchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
  });

export class BigNumbersFornecedoresAdminQueryDto extends createZodDto(
  BigNumbersFornecedoresAdminQuerySchema,
) {}
