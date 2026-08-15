import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarFornecedoresQuerySchema } from './buscar-fornecedores-query.dto';

export const BuscarFornecedoresAdminQuerySchema =
  BuscarFornecedoresQuerySchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
  });

export class BuscarFornecedoresAdminQueryDto extends createZodDto(
  BuscarFornecedoresAdminQuerySchema,
) {}
