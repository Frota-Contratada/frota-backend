import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { BuscarColaboradoresQuerySchema } from './buscar-colaboradores-query.dto';

export const BuscarColaboradoresAdminQuerySchema =
  BuscarColaboradoresQuerySchema.extend({
    filialId: z.coerce.number().int().positive().optional(),
    empresaId: z.coerce.number().int().positive().optional(),
  }).refine((filtros) => !filtros.filialId || !!filtros.empresaId, {
    path: ['empresaId'],
    message: 'Informe empresaId ao filtrar filialId',
  });

export class BuscarColaboradoresAdminQueryDto extends createZodDto(
  BuscarColaboradoresAdminQuerySchema,
) {}
