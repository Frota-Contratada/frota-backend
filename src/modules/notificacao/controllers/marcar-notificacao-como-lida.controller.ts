import { Controller, NotFoundException, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { MarcarNotificacaoComoLidaService } from '../services/marcar-notificacao-como-lida.service';
import { NotificacaoDto } from './dtos/response/notificacao.dto';

@ApiTags('Notificação')
@ApiBearerAuth()
@Controller()
export class MarcarNotificacaoComoLidaController {
  constructor(
    private readonly marcarNotificacaoComoLidaService: MarcarNotificacaoComoLidaService,
  ) {}

  @Patch(':id/lida')
  @ApiRespostaDe(NotificacaoDto)
  async handle(
    @CurrentUser('id') usuarioId: number,
    @Param('id') notificacaoId: string,
  ): Promise<ResponseInterface<NotificacaoDto>> {
    const notificacao = await this.marcarNotificacaoComoLidaService.execute(
      usuarioId,
      notificacaoId,
    );

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    return { response: new NotificacaoDto(notificacao) };
  }
}
