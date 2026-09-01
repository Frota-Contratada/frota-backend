import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';

export const CamposMotivoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: 'Informe o nome do motivo' })
    .max(100, { message: 'O nome do motivo deve ter no máximo 100 caracteres' }),
  tipo: z.enum(TipoMotivo),
});

export const CriarMotivoRequestSchema = CamposMotivoSchema.extend({
  tipo: z.enum(TipoMotivo).default(TipoMotivo.SOLICITACAO),
});

export class CriarMotivoRequestDto extends createZodDto(
  CriarMotivoRequestSchema,
) {}
