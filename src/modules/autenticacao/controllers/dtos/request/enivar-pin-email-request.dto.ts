import { TipoToken } from '@module/autenticacao/enums/tipo-token.enum';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const EnviarPinEmailRequestSchema = z.object({
  tipoToken: z.nativeEnum(TipoToken),
  email: z.email(),
});

export class EnviarPinEmailRequestDto extends createZodDto(
  EnviarPinEmailRequestSchema,
) {}
