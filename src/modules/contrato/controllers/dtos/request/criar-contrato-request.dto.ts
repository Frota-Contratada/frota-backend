import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const idSchema = z.coerce.number().int().positive();

export const CriarContratoRequestSchema = z.object({
  dataVigenciaInicio: z.string().date().pipe(z.coerce.date()),
  dataVigenciaFim: z.string().date().pipe(z.coerce.date()).optional(),
  empresaId: idSchema,
  filialId: idSchema,
  fornecedorId: idSchema,
  // multipart/form-data envia listas como "1,2" ou campos repetidos.
  tipoCorridaIds: z.preprocess(
    (valor) => (typeof valor === 'string' ? valor.split(',') : valor),
    z
      .array(idSchema)
      .min(1, { message: 'Informe ao menos um tipo de corrida atendido' }),
  ),
});

export class CriarContratoRequestDto extends createZodDto(
  CriarContratoRequestSchema,
) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo do contrato.',
  })
  arquivo!: string;

  @ApiProperty({
    type: 'string',
    format: 'date',
    description: 'Data de início da vigência do contrato.',
  })
  dataVigenciaInicio!: Date;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    description: 'Data de término da vigência do contrato.',
  })
  dataVigenciaFim?: Date;

  @ApiProperty({ example: 30, description: 'Empresa da filial atendida.' })
  empresaId!: number;

  @ApiProperty({ example: 704, description: 'Filial atendida.' })
  filialId!: number;

  @ApiProperty({ example: 864, description: 'Fornecedor contratado.' })
  fornecedorId!: number;

  @ApiProperty({
    type: 'string',
    example: '1,2',
    description: 'Tipos de corrida atendidos, separados por vírgula.',
  })
  tipoCorridaIds!: number[];
}
