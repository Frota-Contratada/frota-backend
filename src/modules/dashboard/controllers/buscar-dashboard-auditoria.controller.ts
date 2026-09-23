import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { DashboardAuditoriaResponse } from '../domain/dashboard-auditoria.types';
import { BuscarDashboardAuditoriaService } from '../services/buscar-dashboard-auditoria.service';
import { BuscarDashboardQueryDto } from './dtos/request/buscar-dashboard-query.dto';
import { DashboardAuditoriaDto } from './dtos/response/dashboard-auditoria.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class BuscarDashboardAuditoriaController {
  constructor(
    private readonly buscarDashboardAuditoriaService: BuscarDashboardAuditoriaService,
  ) {}

  @Get('auditoria/admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiOperation({
    summary: 'Busca a auditoria de preço e quilometragem de todas as filiais',
    description:
      'Considera somente corridas finalizadas, únicas com quilometragem e valor final reais para comparar com o previsto.',
  })
  async buscarComoAdminMaster(
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardAuditoriaDto>> {
    return this.montarResponse(
      await this.buscarDashboardAuditoriaService.execute(query),
    );
  }

  @Get('auditoria/filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiOperation({
    summary: 'Busca a auditoria de preço e quilometragem da filial do usuário',
  })
  async buscarComoAdminFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardAuditoriaDto>> {
    if (filialId == null) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    return this.montarResponse(
      await this.buscarDashboardAuditoriaService.execute(query, { filialId }),
    );
  }

  @Get('auditoria/aprovador')
  @Perfis(TipoPerfil.APROVADOR)
  @ApiOperation({
    summary:
      'Busca a auditoria das corridas dos centros de custo do aprovador autenticado',
  })
  async buscarComoAprovador(
    @CurrentUser('id') aprovadorId: number,
    @Query() query: BuscarDashboardQueryDto,
  ): Promise<ResponseInterface<DashboardAuditoriaDto>> {
    return this.montarResponse(
      await this.buscarDashboardAuditoriaService.execute(query, {
        aprovadorId,
      }),
    );
  }

  private montarResponse(
    dashboard: DashboardAuditoriaResponse,
  ): ResponseInterface<DashboardAuditoriaDto> {
    return { response: new DashboardAuditoriaDto(dashboard) };
  }
}
