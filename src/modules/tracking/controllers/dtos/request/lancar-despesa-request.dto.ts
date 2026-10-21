import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TipoDespesa } from '../../../domain/tipo-despesa';

export const LancarDespesaRequestSchema = z.object({
  tipo: z.enum(TipoDespesa),
  valor: z
    .number()
    .positive({ message: 'Informe um valor maior que zero' })
    .max(10_000, { message: 'O valor deve ser de no máximo R$ 10.000,00' })
    .multipleOf(0.01, { message: 'Informe o valor em centavos' }),
});

export class LancarDespesaRequestDto extends createZodDto(
  LancarDespesaRequestSchema,
) {}
