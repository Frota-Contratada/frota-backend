import { ApiProperty } from '@nestjs/swagger';

export class AtualizarFotoPerfilRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo da foto de perfil.',
  })
  foto!: string;
}
