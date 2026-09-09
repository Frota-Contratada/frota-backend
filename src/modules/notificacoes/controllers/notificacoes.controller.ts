import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiRespostaDe,
  ApiRespostaListaDe,
} from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { NotificacoesService } from '../services/notificacoes.service';
import {
  NotificacaoDto,
  QuantidadeNotificacoesNaoLidasDto,
} from './dtos/response/notificacao.dto';

@ApiTags('Notificações')
@ApiBearerAuth()
@Controller()
export class NotificacoesController {
  constructor(private readonly notificacoes: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações temporárias do usuário' })
  @ApiRespostaListaDe(NotificacaoDto)
  async listar(
    @CurrentUser('id') usuarioId: number,
  ): Promise<ResponseInterface<NotificacaoDto[]>> {
    const notificacoes = await this.notificacoes.listarPorUsuario(usuarioId);

    return { response: notificacoes.map((item) => new NotificacaoDto(item)) };
  }

  @Get('nao-lidas/quantidade')
  @ApiOperation({ summary: 'Retorna a quantidade de notificações não lidas' })
  @ApiRespostaDe(QuantidadeNotificacoesNaoLidasDto)
  async contarNaoLidas(
    @CurrentUser('id') usuarioId: number,
  ): Promise<ResponseInterface<QuantidadeNotificacoesNaoLidasDto>> {
    const quantidade = await this.notificacoes.contarNaoLidas(usuarioId);

    return { response: new QuantidadeNotificacoesNaoLidasDto(quantidade) };
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  @ApiRespostaDe(NotificacaoDto)
  async marcarComoLida(
    @CurrentUser('id') usuarioId: number,
    @Param('id') notificacaoId: string,
  ): Promise<ResponseInterface<NotificacaoDto>> {
    const notificacao = await this.notificacoes.marcarComoLida(
      usuarioId,
      notificacaoId,
    );

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    return { response: new NotificacaoDto(notificacao) };
  }
}
