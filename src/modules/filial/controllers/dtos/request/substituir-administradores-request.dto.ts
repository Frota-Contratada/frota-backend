import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const SubstituirAdministradoresRequestSchema = z.object({
  administradorIds: z.array(z.number().int().positive()),
});

export class SubstituirAdministradoresRequestDto extends createZodDto(
  SubstituirAdministradoresRequestSchema,
) {}
