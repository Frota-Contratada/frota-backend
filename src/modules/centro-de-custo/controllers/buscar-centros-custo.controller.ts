import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { BuscarCentrosCustoService } from '../services/buscar-centros-custo.service';
import { CentroCustoDto } from './dtos/response/centro-custo.dto';

@ApiTags('Centro de custo')
@ApiBearerAuth()
@Controller()
export class BuscarCentrosCustoController {
  constructor(
    private readonly buscarCentrosCustoService: BuscarCentrosCustoService,
  ) {}

  @Get()
  @ApiRespostaListaDe(CentroCustoDto)
  async handle(
    @CurrentUser('id') usuarioId: number,
  ): Promise<ResponseInterface<CentroCustoDto[]>> {
    const centrosCusto =
      await this.buscarCentrosCustoService.execute(usuarioId);

    return {
      response: centrosCusto.map((item) =>
        CentroCustoDto.aPartirDoDominio(item),
      ),
    };
  }
}
