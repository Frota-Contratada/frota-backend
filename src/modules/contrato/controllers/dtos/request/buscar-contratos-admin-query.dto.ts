import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarContratosQuerySchema } from './buscar-contratos-query.dto';

export const BuscarContratosAdminQuerySchema =
  BuscarContratosQuerySchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
    empresaId: z.coerce.number().int().positive().optional(),
  }).refine((filtros) => !filtros.filialId || !!filtros.empresaId, {
    path: ['empresaId'],
    message: 'Informe empresaId ao filtrar filialId',
  });

export class BuscarContratosAdminQueryDto extends createZodDto(
  BuscarContratosAdminQuerySchema,
) {}
