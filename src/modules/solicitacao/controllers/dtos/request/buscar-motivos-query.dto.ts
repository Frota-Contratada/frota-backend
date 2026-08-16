import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';

export const BuscarMotivosQuerySchema = z.object({
  tipo: z.enum(TipoMotivo).optional(),
});

export class BuscarMotivosQueryDto extends createZodDto(
  BuscarMotivosQuerySchema,
) {}
