import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const DecisaoAprovadorRequestSchema = z
  .object({
    decisao: z.enum(['APROVAR', 'REPROVAR']),
    fornecedorId: z.number().int().positive().optional(),
    motivoRecusaId: z.number().int().positive().optional(),
  })
  .superRefine((valor, contexto) => {
    if (valor.decisao === 'REPROVAR' && valor.motivoRecusaId == null) {
      contexto.addIssue({
        code: 'custom',
        path: ['motivoRecusaId'],
        message: 'Informe o motivo da reprovação',
      });
    }

    if (valor.decisao === 'REPROVAR' && valor.fornecedorId != null) {
      contexto.addIssue({
        code: 'custom',
        path: ['fornecedorId'],
        message: 'Não informe fornecedor ao reprovar a solicitação',
      });
    }
  });

export class DecisaoAprovadorRequestDto extends createZodDto(
  DecisaoAprovadorRequestSchema,
) {}
