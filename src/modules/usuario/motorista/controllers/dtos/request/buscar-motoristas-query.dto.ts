import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoMotorista } from '../../../enums/ordenacao-motorista.enum';

export const BuscarMotoristasQuerySchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
  ordenarPor: z.enum(CampoOrdenacaoMotorista).optional(),
  direcao: z.enum(DirecaoOrdenacao).default(DirecaoOrdenacao.ASC),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarMotoristasQueryDto extends createZodDto(
  BuscarMotoristasQuerySchema,
) {}
