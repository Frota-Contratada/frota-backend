import { createZodDto } from 'nestjs-zod';
import { CamposMotivoSchema } from './criar-motivo-request.dto';

/**
 * `tipo` é obrigatório de propósito: aqui não há default, para não trocar o
 * tipo do motivo silenciosamente quando o campo é omitido.
 */
export const AtualizarMotivoRequestSchema = CamposMotivoSchema.pick({
  nome: true,
  tipo: true,
});

export class AtualizarMotivoRequestDto extends createZodDto(
  AtualizarMotivoRequestSchema,
) {}
