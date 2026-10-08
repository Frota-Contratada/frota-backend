import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { FiltrosColaboradorSchema } from './buscar-colaboradores-query.dto';

export const BigNumbersColaboradoresAdminQuerySchema =
  FiltrosColaboradorSchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
    empresaId: z.coerce.number().int().positive().optional(),
  }).refine((filtros) => !filtros.filialId || !!filtros.empresaId, {
    path: ['empresaId'],
    message: 'Informe empresaId ao filtrar filialId',
  });

export class BigNumbersColaboradoresAdminQueryDto extends createZodDto(
  BigNumbersColaboradoresAdminQuerySchema,
) {}
