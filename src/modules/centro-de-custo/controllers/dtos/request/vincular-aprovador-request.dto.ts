import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const VincularAprovadorRequestSchema = z.object({
  usuarioId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de usuário válido' }),
  filialId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de filial válido' }),
  centroCustoId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de centro de custo válido' }),
});

export class VincularAprovadorRequestDto extends createZodDto(
  VincularAprovadorRequestSchema,
) {}
