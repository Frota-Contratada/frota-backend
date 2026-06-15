import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const SignUpRequestSchema = z.object({
  token: z.string().nonempty(),
  senha: z
    .string()
    .min(6, { message: 'Informe uma senha com 6 caracteres no mínimo' }),
});

export class SignUpRequestDto extends createZodDto(SignUpRequestSchema) {}
