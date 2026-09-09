import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TrackingPositionSchema } from './tracking-position-request.dto';

export const SalvarPosicoesVeiculoSchema = z.object({
  positions: z.array(TrackingPositionSchema).min(1).max(100),
});

export class SalvarPosicoesVeiculoRequestDto extends createZodDto(
  SalvarPosicoesVeiculoSchema,
) {}
