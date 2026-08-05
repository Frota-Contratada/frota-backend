import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { VincularAprovadorService } from '../services/vincular-aprovador.service';
import { VincularAprovadorRequestDto } from './dtos/request/vincular-aprovador-request.dto';
import { AprovadorCentroCustoDto } from './dtos/response/aprovador-centro-custo.dto';

@ApiTags('Centro de Custo')
@Controller()
export class VincularAprovadorController {
  constructor(
    private readonly vincularAprovadorService: VincularAprovadorService,
  ) {}

  @Post('aprovadores')
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() body: VincularAprovadorRequestDto,
  ): Promise<ResponseInterface<AprovadorCentroCustoDto>> {
    const aprovador = await this.vincularAprovadorService.executar(
      body.usuarioId,
      body.filialId,
      body.centroCustoId,
    );

    const response = new AprovadorCentroCustoDto(
      aprovador.usuarioId,
      aprovador.filialId,
      aprovador.centroCustoId,
      aprovador.dataVinculo.toISO() ?? '',
    );

    return { response };
  }
}
