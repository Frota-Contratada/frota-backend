import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoFornecedor } from '../../../enums/ordenacao-fornecedor.enum';

export const FiltrosFornecedorSchema = z.object({
  nome: z.string().optional(),
  cnpjCpf: z.string().optional(),
});

export const BuscarFornecedoresQuerySchema = FiltrosFornecedorSchema.extend({
  ordenarPor: z.enum(CampoOrdenacaoFornecedor).optional(),
  direcao: z.enum(DirecaoOrdenacao).default(DirecaoOrdenacao.ASC),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class BuscarFornecedoresQueryDto extends createZodDto(
  BuscarFornecedoresQuerySchema,
) {}
