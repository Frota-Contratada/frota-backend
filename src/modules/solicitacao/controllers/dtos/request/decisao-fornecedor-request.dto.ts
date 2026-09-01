import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const DecisaoFornecedorRequestSchema = z
  .object({
    decisao: z.enum(['REATRIBUIR', 'RECUSAR']),
    motoristaId: z.number().int().positive().optional(),
    veiculoId: z.number().int().positive().optional(),
    motivo: z
      .string()
      .trim()
      .min(5, { message: 'Informe o motivo da recusa' })
      .max(500, { message: 'O motivo deve ter no máximo 500 caracteres' })
      .optional(),
  })
  .superRefine((valor, contexto) => {
    if (valor.decisao === 'REATRIBUIR') {
      if (valor.motoristaId == null) {
        contexto.addIssue({
          code: 'custom',
          path: ['motoristaId'],
          message: 'Informe o motorista para a reatribuição',
        });
      }
      if (valor.veiculoId == null) {
        contexto.addIssue({
          code: 'custom',
          path: ['veiculoId'],
          message: 'Informe o veículo para a reatribuição',
        });
      }
    }

    if (valor.decisao === 'RECUSAR' && valor.motivo == null) {
      contexto.addIssue({
        code: 'custom',
        path: ['motivo'],
        message: 'Informe o motivo da recusa',
      });
    }
  });

export class DecisaoFornecedorRequestDto extends createZodDto(
  DecisaoFornecedorRequestSchema,
) {}
