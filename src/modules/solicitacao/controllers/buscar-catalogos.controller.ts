import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { BuscarMotivosService } from '../services/buscar-motivos.service';
import { BuscarTiposCorridaService } from '../services/buscar-tipos-corrida.service';
import { BuscarTiposVeiculoService } from '../services/buscar-tipos-veiculo.service';
import { BuscarMotivosQueryDto } from './dtos/request/buscar-motivos-query.dto';
import { CatalogoItemDto } from './dtos/response/catalogo-item.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarCatalogosController {
  constructor(
    private readonly buscarMotivosService: BuscarMotivosService,
    private readonly buscarTiposCorridaService: BuscarTiposCorridaService,
    private readonly buscarTiposVeiculoService: BuscarTiposVeiculoService,
  ) {}

  @Get('motivos')
  @ApiOperation({
    summary: 'Lista motivos',
    description:
      'Filtre por tipo para obter os motivos de corrida (1), de cancelamento (2), de recusa (3) ou os objetos transportáveis (4).',
  })
  @ApiRespostaListaDe(CatalogoItemDto)
  async buscarMotivos(
    @Query() query: BuscarMotivosQueryDto,
  ): Promise<ResponseInterface<CatalogoItemDto[]>> {
    const motivos = await this.buscarMotivosService.execute(query.tipo);

    return {
      response: motivos.map((motivo) =>
        CatalogoItemDto.aPartirDoMotivo(motivo),
      ),
    };
  }

  @Get('tipos-corrida')
  @ApiOperation({ summary: 'Lista as modalidades de corrida contratáveis' })
  @ApiRespostaListaDe(CatalogoItemDto)
  async buscarTiposCorrida(): Promise<ResponseInterface<CatalogoItemDto[]>> {
    const tipos = await this.buscarTiposCorridaService.execute();

    return {
      response: tipos.map((tipo) => CatalogoItemDto.aPartirDoTipoCorrida(tipo)),
    };
  }

  @Get('tipos-veiculo')
  @ApiOperation({ summary: 'Lista os tipos de veículo que podem ser pedidos' })
  @ApiRespostaListaDe(CatalogoItemDto)
  async buscarTiposVeiculo(): Promise<ResponseInterface<CatalogoItemDto[]>> {
    const tipos = await this.buscarTiposVeiculoService.execute();

    return {
      response: tipos.map((tipo) => CatalogoItemDto.aPartirDoTipoVeiculo(tipo)),
    };
  }
}
