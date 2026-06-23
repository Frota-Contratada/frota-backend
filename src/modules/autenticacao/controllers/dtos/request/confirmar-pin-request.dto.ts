import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const ConfirmarPinRequestSchema = z.object({
  pin: z.string().nonempty(),
  email: z.email(),
});

export class ConfirmarPinRequestDto extends createZodDto(
  ConfirmarPinRequestSchema,
) {}
