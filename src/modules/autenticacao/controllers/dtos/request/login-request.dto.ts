import { Plataforma } from '@common/enums/plataforma.enum';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const LoginRequestSchema = z.object({
  email: z.email({ message: 'Informe um endereço de e-mail válido' }),
  senha: z
    .string()
    .min(6, { message: 'Informe uma senha com 6 caracteres no mínimo' }),
  plataforma: z.enum(Plataforma),
});

export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}
