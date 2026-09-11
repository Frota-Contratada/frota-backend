import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ListarNotificacoesService } from '../services/listar-notificacoes.service';
import { NotificacaoDto } from './dtos/response/notificacao.dto';

@ApiTags('Notificação')
@ApiBearerAuth()
@Controller()
export class ListarNotificacoesController {
  constructor(
    private readonly listarNotificacoesService: ListarNotificacoesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações temporárias do usuário' })
  @ApiRespostaListaDe(NotificacaoDto)
  async handle(
    @CurrentUser('id') usuarioId: number,
  ): Promise<ResponseInterface<NotificacaoDto[]>> {
    const notificacoes = await this.listarNotificacoesService.execute(usuarioId);

    return { response: notificacoes.map((item) => new NotificacaoDto(item)) };
  }
}
