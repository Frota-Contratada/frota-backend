import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { BuscarPreferenciasNotificacaoService } from '../services/buscar-preferencias-notificacao.service';
import { PreferenciasNotificacaoDto } from './dtos/response/preferencias-notificacao.dto';

@ApiTags('Notificação')
@ApiBearerAuth()
@Controller()
export class BuscarPreferenciasNotificacaoController {
  constructor(
    private readonly buscarPreferenciasService: BuscarPreferenciasNotificacaoService,
  ) {}

  @Get('preferencias')
  @ApiRespostaDe(PreferenciasNotificacaoDto)
  async handle(
    @CurrentUser('id') usuarioId: number,
  ): Promise<ResponseInterface<PreferenciasNotificacaoDto>> {
    const preferencias =
      await this.buscarPreferenciasService.execute(usuarioId);
    return { response: new PreferenciasNotificacaoDto(preferencias) };
  }
}
