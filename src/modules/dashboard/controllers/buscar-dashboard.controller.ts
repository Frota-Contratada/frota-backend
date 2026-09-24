import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { BuscarDashboardService } from '../services/buscar-dashboard.service';
import { BuscarDashboardQueryDto } from './dtos/request/buscar-dashboard-query.dto';
import { DashboardDto } from './dtos/response/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class BuscarDashboardController {
  constructor(
    private readonly buscarDashboardService: BuscarDashboardService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarComoAdminMaster(
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardDto>> {
    return this.montarResponse(
      await this.buscarDashboardService.execute(query),
    );
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarComoAdminFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardDto>> {
    if (filialId == null) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    return this.montarResponse(
      await this.buscarDashboardService.execute(query, { filialId }),
    );
  }

  @Get('aprovador')
  @Perfis(TipoPerfil.APROVADOR)
  async buscarComoAprovador(
    @CurrentUser() usuario: AuthenticatedUser,
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardDto>> {
    return this.montarResponse(
      await this.buscarDashboardService.execute(query, {
        aprovadorId: usuario.id,
      }),
    );
  }

  private montarResponse(
    dashboard: Awaited<ReturnType<BuscarDashboardService['execute']>>,
  ): ResponseInterface<DashboardDto> {
    return { response: new DashboardDto(dashboard) };
  }
}
