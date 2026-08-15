import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const VincularCentroCustoRequestSchema = z.object({
  centroCustoId: z.coerce
    .number()
    .int()
    .positive({ message: 'Informe um centro de custo válido' }),
});

export class VincularCentroCustoRequestDto extends createZodDto(
  VincularCentroCustoRequestSchema,
) {}
