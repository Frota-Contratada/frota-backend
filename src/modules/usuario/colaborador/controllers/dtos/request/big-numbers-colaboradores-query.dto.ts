import { createZodDto } from 'nestjs-zod';
import { FiltrosColaboradorSchema } from './buscar-colaboradores-query.dto';

export const BigNumbersColaboradoresQuerySchema = FiltrosColaboradorSchema;

export class BigNumbersColaboradoresQueryDto extends createZodDto(
  BigNumbersColaboradoresQuerySchema,
) {}
