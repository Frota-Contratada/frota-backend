import { createZodDto } from 'nestjs-zod';
import { CriarFornecedorRequestSchema } from './criar-fornecedor-request.dto';

/**
 * `filialId` fica de fora de propósito: o vínculo do fornecedor com filiais é
 * feito pelo contrato, não por esta rota.
 */
export const AtualizarFornecedorRequestSchema =
  CriarFornecedorRequestSchema.pick({
    nome: true,
    cnpjCpf: true,
  });

export class AtualizarFornecedorRequestDto extends createZodDto(
  AtualizarFornecedorRequestSchema,
) {}
