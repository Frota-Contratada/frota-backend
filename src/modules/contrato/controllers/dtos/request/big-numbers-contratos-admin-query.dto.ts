import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { FiltrosContratoSchema } from './buscar-contratos-query.dto';

export const BigNumbersContratosAdminQuerySchema = FiltrosContratoSchema.extend(
  {
    filialId: z.coerce.number().int().positive().optional(),
    empresaId: z.coerce.number().int().positive().optional(),
  },
).refine((filtros) => !filtros.filialId || !!filtros.empresaId, {
  path: ['empresaId'],
  message: 'Informe empresaId ao filtrar filialId',
});

export class BigNumbersContratosAdminQueryDto extends createZodDto(
  BigNumbersContratosAdminQuerySchema,
) {}
