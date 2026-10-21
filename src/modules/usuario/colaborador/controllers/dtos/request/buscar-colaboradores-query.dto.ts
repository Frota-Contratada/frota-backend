import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoColaborador } from '../../../enums/ordenacao-colaborador.enum';

export const FiltrosColaboradorSchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
});

export const BuscarColaboradoresQuerySchema = FiltrosColaboradorSchema.extend({
  ordenarPor: z.enum(CampoOrdenacaoColaborador).optional(),
  direcao: z.enum(DirecaoOrdenacao).default(DirecaoOrdenacao.ASC),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarColaboradoresQueryDto extends createZodDto(
  BuscarColaboradoresQuerySchema,
) {}
