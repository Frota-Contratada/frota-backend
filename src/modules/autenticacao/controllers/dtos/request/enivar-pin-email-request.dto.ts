import { TipoToken } from '@module/autenticacao/enums/tipo-token.enum';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EnviarPinEmailRequestSchema = z.object({
  tipoToken: z
    .enum(['SIGN_UP', 'REDEFINIR_SENHA'])
    .transform((value) =>
      value === 'SIGN_UP' ? TipoToken.SIGN_UP : TipoToken.REDEFINIR_SENHA,
    ),
  email: z.email(),
});

export class EnviarPinEmailRequestDto extends createZodDto(
  EnviarPinEmailRequestSchema,
) {}
