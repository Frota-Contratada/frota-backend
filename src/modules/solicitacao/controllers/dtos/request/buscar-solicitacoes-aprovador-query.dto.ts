import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { OrdenacaoSolicitacao } from '../../../enums/ordenacao-solicitacao.enum';
import { dataIsoSchema } from './data-iso.schema';

export const BuscarSolicitacoesAprovadorQuerySchema = z.object({
  tipoCorridaId: z.coerce.number().int().positive().optional(),
  dataInicio: dataIsoSchema(
    'Informe o início do período em ISO 8601 válido',
  ).optional(),
  dataFim: dataIsoSchema(
    'Informe o fim do período em ISO 8601 válido',
  ).optional(),
  ordenacao: z.enum(OrdenacaoSolicitacao).default(OrdenacaoSolicitacao.RECENTE),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarSolicitacoesAprovadorQueryDto extends createZodDto(
  BuscarSolicitacoesAprovadorQuerySchema,
) {}
