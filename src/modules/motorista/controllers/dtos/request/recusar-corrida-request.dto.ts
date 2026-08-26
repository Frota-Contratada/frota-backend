import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const RecusarCorridaRequestSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, { message: 'Informe o motivo da recusa' })
    .max(500, {
      message: 'O motivo da recusa deve ter no máximo 500 caracteres',
    }),
});

export class RecusarCorridaRequestDto extends createZodDto(
  RecusarCorridaRequestSchema,
) {}
