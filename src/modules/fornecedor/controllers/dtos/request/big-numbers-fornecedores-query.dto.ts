import { createZodDto } from 'nestjs-zod';
import { FiltrosFornecedorSchema } from './buscar-fornecedores-query.dto';

export const BigNumbersFornecedoresQuerySchema = FiltrosFornecedorSchema;

export class BigNumbersFornecedoresQueryDto extends createZodDto(
  BigNumbersFornecedoresQuerySchema,
) {}
