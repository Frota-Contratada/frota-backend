import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const EnderecoSchema = z.object({
  logradouro: z.string().nonempty({ message: 'Informe o logradouro' }),
  numero: z.string().nonempty({ message: 'Informe o número' }),
  complemento: z.string().optional(),
  bairro: z.string().nonempty({ message: 'Informe o bairro' }),
  cidade: z.string().nonempty({ message: 'Informe a cidade' }),
  uf: z.string().length(2, { message: 'Informe a UF com 2 caracteres' }),
  cep: z.string().nonempty({ message: 'Informe o CEP' }),
  latitude: z.number(),
  longitude: z.number(),
});

export const CriarFilialRequestSchema = z.object({
  nome: z.string().nonempty({ message: 'Informe o nome da filial' }),
  cnpj: z.string().length(14, { message: 'Informe um CNPJ com 14 dígitos' }),
  administradorId: z
    .number()
    .int()
    .positive({ message: 'Informe um id de administrador válido' }),
  endereco: EnderecoSchema,
});

export class CriarFilialRequestDto extends createZodDto(
  CriarFilialRequestSchema,
) {}
