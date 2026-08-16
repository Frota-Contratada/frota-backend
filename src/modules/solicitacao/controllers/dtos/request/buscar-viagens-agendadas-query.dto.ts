import { createZodDto } from 'nestjs-zod';
import { DateTime } from 'luxon';
import z from 'zod';
import { dataIsoSchema } from './data-iso.schema';

export const BuscarViagensAgendadasQuerySchema = z
  .object({
    /** Primeiro dia da semana exibida na home, em ISO 8601. */
    inicio: dataIsoSchema('Informe o início do período em ISO 8601 válido'),
    /** Último dia da semana exibida na home, em ISO 8601. */
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

export class BuscarViagensAgendadasQueryDto extends createZodDto(
  BuscarViagensAgendadasQuerySchema,
) {}
