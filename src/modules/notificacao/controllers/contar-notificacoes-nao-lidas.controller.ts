import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ContarNotificacoesNaoLidasService } from '../services/contar-notificacoes-nao-lidas.service';
import { QuantidadeNotificacoesNaoLidasDto } from './dtos/response/notificacao.dto';

@ApiTags('Notificação')
@ApiBearerAuth()
@Controller()
export class ContarNotificacoesNaoLidasController {
  constructor(
    private readonly contarNotificacoesNaoLidasService: ContarNotificacoesNaoLidasService,
  ) {}

  @Get('nao-lidas/quantidade')
  @ApiRespostaDe(QuantidadeNotificacoesNaoLidasDto)
  async handle(
    @CurrentUser('id') usuarioId: number,
  ): Promise<ResponseInterface<QuantidadeNotificacoesNaoLidasDto>> {
    const quantidade =
      await this.contarNotificacoesNaoLidasService.execute(usuarioId);

    return { response: new QuantidadeNotificacoesNaoLidasDto(quantidade) };
  }
}
