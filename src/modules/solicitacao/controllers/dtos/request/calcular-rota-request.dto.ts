import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { dataIsoSchema } from './data-iso.schema';

const PontoRotaSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const CalcularRotaRequestSchema = z.object({
  pontos: z
    .array(PontoRotaSchema)
    .min(2, { message: 'Informe ao menos dois pontos para calcular a rota' })
    .max(12, { message: 'Informe no máximo 12 pontos para calcular a rota' }),
  dataPartida: dataIsoSchema(
    'Informe a data de partida em formato ISO 8601 válido',
  ).optional(),
});

export class CalcularRotaRequestDto extends createZodDto(
  CalcularRotaRequestSchema,
) {}
