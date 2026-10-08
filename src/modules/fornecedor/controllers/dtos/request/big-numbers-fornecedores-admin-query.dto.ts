import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { FiltrosFornecedorSchema } from './buscar-fornecedores-query.dto';

export const BigNumbersFornecedoresAdminQuerySchema =
  FiltrosFornecedorSchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
    empresaId: z.coerce.number().int().positive().optional(),
  }).refine((filtros) => !filtros.filialId || !!filtros.empresaId, {
    path: ['empresaId'],
    message: 'Informe empresaId ao filtrar filialId',
  });

export class BigNumbersFornecedoresAdminQueryDto extends createZodDto(
  BigNumbersFornecedoresAdminQuerySchema,
) {}
