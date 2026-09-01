import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';

/** `z.coerce.boolean` trata `'false'` como `true`, daí a conversão explícita. */
const booleanoDeQuery = z
  .enum(['true', 'false'])
  .transform((valor) => valor === 'true')
  .optional();

export const FiltrosMotivoSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  tipo: z.enum(TipoMotivo).optional(),
  incluirInativos: booleanoDeQuery,
});

export const BuscarMotivosQuerySchema = FiltrosMotivoSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarMotivosQueryDto extends createZodDto(
  BuscarMotivosQuerySchema,
) {}

export { booleanoDeQuery };
