import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { CriarMotivoRequestSchema } from './criar-motivo-request.dto';

export const CriarMotivoAdminRequestSchema = CriarMotivoRequestSchema.extend({
  /** Omitido ou `null` cria um motivo global, válido para todas as filiais. */
  filialId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de filial válido' })
    .nullish(),
});

export class CriarMotivoAdminRequestDto extends createZodDto(
  CriarMotivoAdminRequestSchema,
) {}
