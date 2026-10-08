import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CriarFornecedorRequestSchema = z.object({
  nome: z
    .string()
    .nonempty({ message: 'Informe o nome do fornecedor' })
    .max(150),
  cnpjCpf: z
    .string()
    .min(11, { message: 'Informe um CPF ou CNPJ válido' })
    .max(14, { message: 'Informe um CPF ou CNPJ válido' })
    .nullish(),
  empresaId: z.number().int().positive(),
  filialId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de filial válido' }),
});

export class CriarFornecedorRequestDto extends createZodDto(
  CriarFornecedorRequestSchema,
) {}
