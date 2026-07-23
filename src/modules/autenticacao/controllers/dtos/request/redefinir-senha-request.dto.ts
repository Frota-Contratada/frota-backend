import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const RedefinirSenhaSchema = z.object({
  token: z.string().nonempty(),
  senha: z
    .string()
    .min(6, { message: 'Informe uma senha com 6 caracteres no mínimo' }),
});

export class RedefinirSenhaRequestDto extends createZodDto(
  RedefinirSenhaSchema,
) {}
