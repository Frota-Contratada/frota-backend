import { ApiProperty } from '@nestjs/swagger';

export class AtualizarFotoFornecedorRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo da foto do fornecedor.',
  })
  foto!: string;
}
