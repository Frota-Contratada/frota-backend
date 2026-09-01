import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Lista os centros de custo da filial do usuário autenticado',
    description:
      'Indica se cada centro de custo está ativo e se possui aprovador vigente. Sem aprovador, ele não pode ser usado em uma solicitação.',
  })
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
