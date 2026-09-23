import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { DashboardGastosResponse } from '../domain/dashboard-gastos.types';
import { BuscarDashboardGastosService } from '../services/buscar-dashboard-gastos.service';
import { BuscarDashboardQueryDto } from './dtos/request/buscar-dashboard-query.dto';
import { DashboardGastosDto } from './dtos/response/dashboard-gastos.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class BuscarDashboardGastosController {
  constructor(
    private readonly buscarDashboardGastosService: BuscarDashboardGastosService,
  ) {}

  @Get('gastos/admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiOperation({
    summary: 'Busca o dashboard de gastos de todas as filiais',
  })
  async buscarComoAdminMaster(
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardGastosDto>> {
    return this.montarResponse(
      await this.buscarDashboardGastosService.execute(query),
    );
  }

  @Get('gastos/filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiOperation({
    summary: 'Busca o dashboard de gastos da filial do usuário',
  })
  async buscarComoAdminFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardGastosDto>> {
    if (filialId == null) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    return this.montarResponse(
      await this.buscarDashboardGastosService.execute(query, { filialId }),
    );
  }

  @Get('gastos/aprovador')
  @Perfis(TipoPerfil.APROVADOR)
  @ApiOperation({
    summary: 'Busca o dashboard de gastos dos centros de custo do aprovador',
  })
  async buscarComoAprovador(
    @CurrentUser('id') aprovadorId: number,
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardGastosDto>> {
    return this.montarResponse(
      await this.buscarDashboardGastosService.execute(query, { aprovadorId }),
    );
  }

  private montarResponse(
    dashboard: DashboardGastosResponse,
  ): ResponseInterface<DashboardGastosDto> {
    return { response: new DashboardGastosDto(dashboard) };
  }
}
