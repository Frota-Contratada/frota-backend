import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CancelarSolicitacaoRequestSchema = z.object({
  motivoCancelamentoId: z.number().int().positive(),
});

export class CancelarSolicitacaoRequestDto extends createZodDto(
  CancelarSolicitacaoRequestSchema,
) {}
