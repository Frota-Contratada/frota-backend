import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { dataIsoSchema } from './data-iso.schema';
import { EnderecoRequestSchema } from './criar-solicitacao-request.dto';

export const SimularSolicitacaoRequestSchema = z.object({
  dataCorrida: dataIsoSchema(
    'Informe a data da corrida em formato ISO 8601 válido',
  ),
  tipoCorridaId: z.number().int().positive(),
  tipoVeiculoId: z.number().int().positive().optional(),
  origem: EnderecoRequestSchema,
  destino: EnderecoRequestSchema,
  paradas: z.array(EnderecoRequestSchema).max(10).default([]),
});

export class SimularSolicitacaoRequestDto extends createZodDto(
  SimularSolicitacaoRequestSchema,
) {}
