import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export const PERFIS_DO_CADASTRO = [
  TipoPerfil.SOLICITANTE,
  TipoPerfil.APROVADOR,
  TipoPerfil.SOLICITANTE_EMERGENCIA,
] as const;

export const CriarColaboradorRequestSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, { message: 'Informe o nome do colaborador' })
      .max(100, { message: 'O nome aceita até 100 caracteres' }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(
        z
          .email({ message: 'Informe um endereço de e-mail válido' })
          .max(100, { message: 'O e-mail aceita até 100 caracteres' }),
      ),
    // Aceita o CPF formatado e guarda só os dígitos.
    cpf: z
      .string()
      .transform((valor) => valor.replace(/\D/g, ''))
      .pipe(z.string().length(11, { message: 'Informe um CPF com 11 dígitos' }))
      .optional(),
    cargo: z
      .string()
      .trim()
      .max(100, { message: 'O cargo aceita até 100 caracteres' })
      .optional(),
    // Obrigatórios para o admin master; o admin de filial usa a própria filial.
    empresaId: z.number().int().positive().optional(),
    filialId: z.number().int().positive().optional(),
    centroCustoId: z
      .number()
      .int()
      .positive({ message: 'Informe um centro de custo válido' }),
    perfis: z
      .array(z.enum(PERFIS_DO_CADASTRO))
      .min(1, { message: 'Selecione pelo menos um perfil de acesso' }),
  })
  .refine(
    ({ perfis }) =>
      !perfis.includes(TipoPerfil.SOLICITANTE_EMERGENCIA) ||
      perfis.includes(TipoPerfil.SOLICITANTE),
    {
      path: ['perfis'],
      message: 'O perfil de emergência exige também o perfil de solicitante',
    },
  )
  .refine(
    ({ perfis }) =>
      perfis.includes(TipoPerfil.SOLICITANTE) ||
      perfis.includes(TipoPerfil.APROVADOR),
    {
      path: ['perfis'],
      message: 'Selecione o perfil de solicitante ou de aprovador',
    },
  );

export class CriarColaboradorRequestDto extends createZodDto(
  CriarColaboradorRequestSchema,
) {}
