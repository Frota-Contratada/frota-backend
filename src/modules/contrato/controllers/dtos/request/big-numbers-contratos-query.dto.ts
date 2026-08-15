import { createZodDto } from 'nestjs-zod';
import { FiltrosContratoSchema } from './buscar-contratos-query.dto';

export const BigNumbersContratosQuerySchema = FiltrosContratoSchema;

export class BigNumbersContratosQueryDto extends createZodDto(
  BigNumbersContratosQuerySchema,
) {}
