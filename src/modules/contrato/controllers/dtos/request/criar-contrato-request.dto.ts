import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CriarContratoRequestSchema = z.object({
  dataVigenciaInicio: z.string().date().pipe(z.coerce.date()),
  dataVigenciaFim: z.string().date().pipe(z.coerce.date()).optional(),
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
}
