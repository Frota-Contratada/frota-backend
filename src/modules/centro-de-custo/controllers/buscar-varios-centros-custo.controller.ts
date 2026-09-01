import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { CentroCusto } from '../domain/centro-custo';
import { BuscarVariosCentrosCustoService } from '../services/buscar-varios-centros-custo.service';
import { BuscarCentrosCustoAdminQueryDto } from './dtos/request/buscar-centros-custo-admin-query.dto';
import { BuscarCentrosCustoQueryDto } from './dtos/request/buscar-centros-custo-query.dto';
import { CentroCustoAdminDto } from './dtos/response/centro-custo-admin.dto';

@ApiTags('Centro de Custo')
@ApiBearerAuth()
@Controller()
export class BuscarVariosCentrosCustoController {
  constructor(
    private readonly buscarVariosCentrosCustoService: BuscarVariosCentrosCustoService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiOperation({
    summary: 'Lista centros de custo de todas as filiais',
    description:
      'Exclusivo para admin master. Filtra por filial e nome. Os filtros informados são combinados entre si.',
  })
  async buscarVarios(
    @Query() query: BuscarCentrosCustoAdminQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<CentroCustoAdminDto>>
  > {
    const resultado = await this.buscarVariosCentrosCustoService.execute(query);

    return { response: this.montarResponse(resultado) };
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiOperation({
    summary: 'Lista centros de custo da filial do usuário',
    description:
      'Exclusivo para admin de filial. A filial é obtida do vínculo do usuário autenticado. Filtra por nome.',
  })
  async buscarVariosDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarCentrosCustoQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<CentroCustoAdminDto>>
  > {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosCentrosCustoService.execute({
      ...query,
      filialId,
    });

    return { response: this.montarResponse(resultado) };
  }

  private montarResponse(
    resultado: PaginatedResponseInterface<CentroCusto>,
  ): PaginatedResponseInterface<CentroCustoAdminDto> {
    return {
      totalCount: resultado.totalCount,
      hasNextPage: resultado.hasNextPage,
      data: resultado.data.map(
        (centroCusto) => new CentroCustoAdminDto(centroCusto),
      ),
    };
  }
}
