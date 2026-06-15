import { Plataforma } from '@common/enums/plataforma.enum';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().nonempty(),
});

export class RefreshTokenRequestDto extends createZodDto(
  RefreshTokenRequestSchema,
) {}
