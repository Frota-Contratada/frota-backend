import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CriarEmpresaRequestSchema = z.object({
  empresaId: z.number().int().positive(),
  nome: z.string().min(1).max(100),
  ativacao: z.iso.datetime(),
});

export class CriarEmpresaRequestDto extends createZodDto(
  CriarEmpresaRequestSchema,
) {}
