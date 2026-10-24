import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CalcularRotaSolicitacaoService } from '../services/calcular-rota-solicitacao.service';
import { CalcularRotaRequestDto } from './dtos/request/calcular-rota-request.dto';
import { RotaSolicitacaoDto } from './dtos/response/rota-solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class CalcularRotaController {
  constructor(private readonly service: CalcularRotaSolicitacaoService) {}

  @Post('rota')
  @HttpCode(HttpStatus.OK)
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiRespostaDe(RotaSolicitacaoDto)
  async handle(
    @Body() body: CalcularRotaRequestDto,
  ): Promise<ResponseInterface<RotaSolicitacaoDto>> {
    const rota = await this.service.execute(
      body.pontos,
      body.dataPartida == null ? undefined : DateTime.fromISO(body.dataPartida),
    );
    return { response: new RotaSolicitacaoDto(rota) };
  }
}
