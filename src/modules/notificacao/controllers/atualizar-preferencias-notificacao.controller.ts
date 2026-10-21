import { Body, Controller, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { AtualizarPreferenciasNotificacaoService } from '../services/atualizar-preferencias-notificacao.service';
import { AtualizarPreferenciasNotificacaoRequestDto } from './dtos/request/atualizar-preferencias-notificacao-request.dto';
import { PreferenciasNotificacaoDto } from './dtos/response/preferencias-notificacao.dto';

@ApiTags('Notificação')
@ApiBearerAuth()
@Controller()
export class AtualizarPreferenciasNotificacaoController {
  constructor(
    private readonly atualizarPreferenciasService: AtualizarPreferenciasNotificacaoService,
  ) {}

  @Patch('preferencias')
  @ApiRespostaDe(PreferenciasNotificacaoDto)
  async handle(
    @CurrentUser('id') usuarioId: number,
    @Body() body: AtualizarPreferenciasNotificacaoRequestDto,
  ): Promise<ResponseInterface<PreferenciasNotificacaoDto>> {
    const preferencias = await this.atualizarPreferenciasService.execute(
      usuarioId,
      body,
    );
    return { response: new PreferenciasNotificacaoDto(preferencias) };
  }
}
