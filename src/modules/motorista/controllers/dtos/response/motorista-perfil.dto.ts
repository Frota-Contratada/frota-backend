import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MotoristaPerfil } from '../../../domain/motorista-corrida';
import { MotoristaCorridaDto } from './motorista-corrida.dto';

export class MotoristaPerfilDto {
  @ApiProperty({ example: 1001 })
  id: number;

  @ApiProperty({ example: 'Marcos Vinícius Alves' })
  nome: string;

  @ApiProperty({ example: 'motorista@empresa.com' })
  email: string;

  @ApiPropertyOptional({ example: '11122233344' })
  cpf?: string;

  @ApiPropertyOptional({ example: 'Transportes Aurora' })
  fornecedorNome?: string;

  @ApiPropertyOptional({ description: 'Foto em data URL.' })
  fotoPerfil?: string;

  @ApiProperty({ example: 20 })
  viagensFinalizadas: number;

  @ApiProperty({ example: 5 })
  transportesDeItens: number;

  @ApiProperty({ type: () => [MotoristaCorridaDto] })
  historico: MotoristaCorridaDto[];

  constructor(perfil: MotoristaPerfil) {
    this.id = perfil.id;
    this.nome = perfil.nome;
    this.email = perfil.email;
    this.cpf = perfil.cpf;
    this.fornecedorNome = perfil.fornecedorNome;
    this.fotoPerfil = perfil.fotoPerfil;
    this.viagensFinalizadas = perfil.viagensFinalizadas;
    this.transportesDeItens = perfil.transportesDeItens;
    this.historico = perfil.historico.map(
      (corrida) => new MotoristaCorridaDto(corrida),
    );
  }
}
