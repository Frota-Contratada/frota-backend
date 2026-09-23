import { createZodDto } from 'nestjs-zod';
import { DateTime } from 'luxon';
import z from 'zod';
import { dataIsoSchema } from '@module/solicitacao/controllers/dtos/request/data-iso.schema';

export const BuscarDashboardQuerySchema = z
  .object({
    startDate: dataIsoSchema(
      'Informe startDate em formato ISO 8601 válido',
    ).optional(),
    endDate: dataIsoSchema(
      'Informe endDate em formato ISO 8601 válido',
    ).optional(),
    filial: z.coerce.number().int().positive().optional(),
    centroCusto: z.coerce.number().int().positive().optional(),
  })
  .superRefine((filtros, contexto) => {
    if (!filtros.startDate || !filtros.endDate) return;

    const inicio = DateTime.fromISO(filtros.startDate);
    const fim = DateTime.fromISO(filtros.endDate);

    if (inicio.toMillis() > fim.toMillis()) {
      contexto.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'endDate deve ser maior ou igual a startDate',
      });
    }
  });

export class BuscarDashboardQueryDto extends createZodDto(
  BuscarDashboardQuerySchema,
) {}
