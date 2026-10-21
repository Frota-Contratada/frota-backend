import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CriarVeiculoRequestSchema = z.object({
  // Aceita "ABC-1D23" ou "abc1d23" e guarda no formato da placa: ABC1D23.
  placa: z
    .string()
    .transform((valor) => valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    .pipe(
      z.string().regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, {
        message: 'Informe uma placa válida (ABC1234 ou ABC1D23)',
      }),
    ),
  tipoVeiculoId: z.number().int().positive(),
  modelo: z.string().trim().min(1).max(60).optional(),
  fornecedorId: z.number().int().positive().optional(),
});

export class CriarVeiculoRequestDto extends createZodDto(
  CriarVeiculoRequestSchema,
) {}
