import { createZodDto } from 'nestjs-zod';
import { CriarFilialRequestSchema } from './criar-filial-request.dto';

export const AtualizarFilialRequestSchema = CriarFilialRequestSchema.pick({
  nome: true,
  endereco: true,
});

export class AtualizarFilialRequestDto extends createZodDto(
  AtualizarFilialRequestSchema,
) {}
