import { createZodDto } from 'nestjs-zod';
import { DateTime } from 'luxon';
import z from 'zod';
import { dataIsoSchema } from '@module/solicitacao/controllers/dtos/request/data-iso.schema';

export const BuscarViagensQuerySchema = z
  .object({
    inicio: dataIsoSchema('Informe o início do período em ISO 8601 válido'),
    fim: dataIsoSchema('Informe o fim do período em ISO 8601 válido'),
  })
  .refine(
    (valores) =>
      DateTime.fromISO(valores.inicio) <= DateTime.fromISO(valores.fim),
    {
      message: 'O início do período deve ser anterior ou igual ao fim',
      path: ['inicio'],
    },
  );

export class BuscarViagensQueryDto extends createZodDto(
  BuscarViagensQuerySchema,
) {}
