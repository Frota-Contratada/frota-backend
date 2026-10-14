import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { CategoriaNotificacao } from '../../../domain/preferencias-notificacao';

const CategoriasSchema = z
  .object(
    Object.fromEntries(
      Object.values(CategoriaNotificacao).map((categoria) => [
        categoria,
        z.boolean().optional(),
      ]),
    ) as Record<CategoriaNotificacao, z.ZodOptional<z.ZodBoolean>>,
  )
  .strict();

export const AtualizarPreferenciasNotificacaoRequestSchema = z
  .object({
    pushAtivo: z.boolean().optional(),
    categorias: CategoriasSchema.optional(),
  })
  .strict()
  .refine(
    (corpo) =>
      corpo.pushAtivo !== undefined ||
      Object.keys(corpo.categorias ?? {}).length > 0,
    { message: 'Informe ao menos uma preferência.' },
  );

export class AtualizarPreferenciasNotificacaoRequestDto extends createZodDto(
  AtualizarPreferenciasNotificacaoRequestSchema,
) {}
