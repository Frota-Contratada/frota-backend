import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CancelarCorridaRequestSchema = z.object({
  motivoCancelamentoId: z.number().int().positive(),
});

export class CancelarCorridaRequestDto extends createZodDto(
  CancelarCorridaRequestSchema,
) {}
