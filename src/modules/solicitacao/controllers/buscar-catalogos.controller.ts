import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { BuscarVariosMotivosService } from '@module/motivo/services/buscar-varios-motivos.service';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { BuscarTiposCorridaService } from '../services/buscar-tipos-corrida.service';
import { BuscarTiposVeiculoService } from '../services/buscar-tipos-veiculo.service';
import { BuscarMotivosQueryDto } from './dtos/request/buscar-motivos-query.dto';
import { CatalogoItemDto } from './dtos/response/catalogo-item.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarCatalogosController {
  constructor(
    private readonly buscarVariosMotivosService: BuscarVariosMotivosService,
    private readonly buscarTiposCorridaService: BuscarTiposCorridaService,
    private readonly buscarTiposVeiculoService: BuscarTiposVeiculoService,
  ) {}

  @Get('motivos')
  @ApiOperation({
    summary: 'Lista os motivos disponíveis para a filial do usuário',
    description:
      'Retorna os motivos ativos da filial do usuário autenticado somados aos motivos globais. Filtre por tipo: solicitacao, cancelamento ou recusa.',
  })
  @ApiRespostaListaDe(CatalogoItemDto)
  async buscarMotivos(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarMotivosQueryDto,
  ): Promise<ResponseInterface<CatalogoItemDto[]>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosMotivosService.execute({
      filialId,
      tipo: query.tipo,
      page: 1,
      limit: 100,
    });

    return {
      response: resultado.data.map((motivo) =>
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
