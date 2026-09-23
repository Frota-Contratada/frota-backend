import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import type { CorridaStatus } from '../../../repositories/prisma-corrida.repository';

export class CorridaPessoaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  constructor(id: number, nome: string) {
    this.id = id;
    this.nome = nome;
  }
}

export class CorridaVeiculoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  placa: string;

  constructor(id: number, placa: string) {
    this.id = id;
    this.placa = placa;
  }
}

export class CorridaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  solicitacaoId: number;

  @ApiProperty({ enum: ['A', 'I', 'F', 'C'] })
  status: CorridaStatus;

  @ApiProperty({ format: 'date-time' })
  dataAgendada: string;

  @ApiProperty({ format: 'date-time' })
  inicio: string;

  @ApiPropertyOptional({ format: 'date-time' })
  fim?: string;

  @ApiProperty()
  quilometragem: number;

  @ApiProperty()
  valorFinal: number;

  @ApiProperty()
  solicitante: CorridaPessoaDto;

  @ApiProperty()
  motorista: CorridaPessoaDto;

  @ApiProperty()
  fornecedor: CorridaPessoaDto;

  @ApiProperty()
  veiculo: CorridaVeiculoDto;

  static fromRecord(record: {
    nCdCorrida: { toNumber(): number };
    nCdSolicitacao: { toNumber(): number };
    cStatus: string;
    dInicioCorrida: Date;
    dFimCorrida: Date | null;
    nKmPercorrido: { toNumber(): number };
    nValorFinal: { toNumber(): number };
    Usuario: { nCdUsuario: { toNumber(): number }; cNmUsuario: string };
    Veiculo: {
      nCdVeiculo: { toNumber(): number };
      cPlaca: string;
      Fornecedor: {
        nCdFornecedor: { toNumber(): number };
        cNmFornecedor: string;
      };
    };
    Solicitacao: {
      dCorrida: Date;
      Usuario: { nCdUsuario: { toNumber(): number }; cNmUsuario: string };
    };
  }): CorridaDto {
    const dto = new CorridaDto();
    dto.id = record.nCdCorrida.toNumber();
    dto.solicitacaoId = record.nCdSolicitacao.toNumber();
    dto.status = record.cStatus.trim() as CorridaStatus;
    dto.dataAgendada = DateTime.fromJSDate(
      record.Solicitacao.dCorrida,
    ).toISO()!;
    dto.inicio = DateTime.fromJSDate(record.dInicioCorrida).toISO()!;
    dto.fim = record.dFimCorrida
      ? DateTime.fromJSDate(record.dFimCorrida).toISO()!
      : undefined;
    dto.quilometragem = record.nKmPercorrido.toNumber();
    dto.valorFinal = record.nValorFinal.toNumber();
    dto.solicitante = new CorridaPessoaDto(
      record.Solicitacao.Usuario.nCdUsuario.toNumber(),
      record.Solicitacao.Usuario.cNmUsuario,
    );
    dto.motorista = new CorridaPessoaDto(
      record.Usuario.nCdUsuario.toNumber(),
      record.Usuario.cNmUsuario,
    );
    dto.fornecedor = new CorridaPessoaDto(
      record.Veiculo.Fornecedor.nCdFornecedor.toNumber(),
      record.Veiculo.Fornecedor.cNmFornecedor,
    );
    dto.veiculo = new CorridaVeiculoDto(
      record.Veiculo.nCdVeiculo.toNumber(),
      record.Veiculo.cPlaca,
    );
    return dto;
  }
}
