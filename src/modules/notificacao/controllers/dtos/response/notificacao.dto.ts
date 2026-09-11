import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AcaoNotificacao,
  Notificacao,
  TipoNotificacao,
} from '../../../domain/notificacao';

export class AcaoNotificacaoDto {
  @ApiProperty({ example: '/solicitacoes' })
  rota: string;

  @ApiPropertyOptional({
    example: { solicitacaoId: '123' },
    additionalProperties: { type: 'string' },
  })
  parametros?: Record<string, string>;

  constructor(acao: AcaoNotificacao) {
    this.rota = acao.rota;
    this.parametros = acao.parametros;
  }
}

export class NotificacaoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: TipoNotificacao })
  tipo: TipoNotificacao;

  @ApiProperty({ example: 'Lembrete de viagem' })
  titulo: string;

  @ApiProperty({ example: 'Sua viagem está agendada para 02/09/2026, 09:30.' })
  mensagem: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  dados?: Record<string, unknown>;

  @ApiPropertyOptional({ type: () => AcaoNotificacaoDto })
  acao?: AcaoNotificacaoDto;

  @ApiProperty({ format: 'date-time' })
  criadaEm: string;

  @ApiProperty({ format: 'date-time' })
  expiraEm: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  lidaEm: string | null;

  constructor(notificacao: Notificacao) {
    this.id = notificacao.id;
    this.tipo = notificacao.tipo;
    this.titulo = notificacao.titulo;
    this.mensagem = notificacao.mensagem;
    this.dados = notificacao.dados;
    this.acao = notificacao.acao
      ? new AcaoNotificacaoDto(notificacao.acao)
      : undefined;
    this.criadaEm = notificacao.criadaEm;
    this.expiraEm = notificacao.expiraEm;
    this.lidaEm = notificacao.lidaEm;
  }
}

export class QuantidadeNotificacoesNaoLidasDto {
  @ApiProperty({ example: 3 })
  quantidade: number;

  constructor(quantidade: number) {
    this.quantidade = quantidade;
  }
}
