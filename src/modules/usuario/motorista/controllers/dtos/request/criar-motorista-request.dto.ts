import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CriarMotoristaRequestSchema = z.object({
  nome: z.string().nonempty({ message: 'Informe o nome do motorista' }),
  email: z.email({ message: 'Informe um endereço de e-mail válido' }),
  cpf: z
    .string()
    .length(11, { message: 'Informe um CPF com 11 dígitos' }),
  fornecedorId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de fornecedor válido' })
    .max(9999999999, { message: 'Id de fornecedor inválido' }),
});

export class CriarMotoristaRequestDto extends createZodDto(
  CriarMotoristaRequestSchema,
) {}
