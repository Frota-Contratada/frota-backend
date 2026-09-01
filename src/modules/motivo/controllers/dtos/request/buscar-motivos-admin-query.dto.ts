import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  booleanoDeQuery,
  BuscarMotivosQuerySchema,
} from './buscar-motivos-query.dto';

export const BuscarMotivosAdminQuerySchema = BuscarMotivosQuerySchema.extend({
  /** Retorna os motivos da filial somados aos globais. */
  filialId: z.coerce.number().int().positive().optional(),
  /** Restringe o resultado apenas aos motivos globais. */
  apenasGlobais: booleanoDeQuery,
});

export class BuscarMotivosAdminQueryDto extends createZodDto(
  BuscarMotivosAdminQuerySchema,
) {}
