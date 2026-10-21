import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BuscarSugestoesEnderecoQuerySchema = z
  .object({
    busca: z
      .string()
      .trim()
      .min(3, { message: 'Digite ao menos 3 caracteres para buscar' })
      .max(200),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((query) => (query.latitude == null) === (query.longitude == null), {
    message: 'Informe latitude e longitude juntas',
  });

export class BuscarSugestoesEnderecoQueryDto extends createZodDto(
  BuscarSugestoesEnderecoQuerySchema,
) {}
