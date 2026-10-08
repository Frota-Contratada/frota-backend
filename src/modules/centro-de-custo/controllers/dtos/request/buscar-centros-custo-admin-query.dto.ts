import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarCentrosCustoQuerySchema } from './buscar-centros-custo-query.dto';

export const BuscarCentrosCustoAdminQuerySchema =
  BuscarCentrosCustoQuerySchema.extend({
    empresaId: z.coerce.number().int().positive().optional(),
    filialId: z.coerce.number().int().positive().optional(),
  }).refine((filtros) => !filtros.filialId || !!filtros.empresaId, {
    path: ['empresaId'],
    message: 'Informe empresaId ao filtrar filialId',
  });

export class BuscarCentrosCustoAdminQueryDto extends createZodDto(
  BuscarCentrosCustoAdminQuerySchema,
) {}
