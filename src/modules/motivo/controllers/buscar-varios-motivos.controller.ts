import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { Motivo } from '../domain/motivo';
import { BuscarVariosMotivosService } from '../services/buscar-varios-motivos.service';
import { BuscarMotivosAdminQueryDto } from './dtos/request/buscar-motivos-admin-query.dto';
import { BuscarMotivosQueryDto } from './dtos/request/buscar-motivos-query.dto';
import { MotivoDto } from './dtos/response/motivo.dto';

@ApiTags('Motivo')
@ApiBearerAuth()
@Controller()
export class BuscarVariosMotivosController {
  constructor(
    private readonly buscarVariosMotivosService: BuscarVariosMotivosService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiOperation({
    summary: 'Lista motivos globais e de todas as filiais',
    description:
      'Exclusivo para admin master. Filtra por nome e tipo. Informar filialId retorna os motivos daquela filial somados aos globais; apenasGlobais restringe aos globais. Por padrão traz somente os ativos.',
  })
  async buscarVarios(
    @Query() query: BuscarMotivosAdminQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<MotivoDto>>> {
    const resultado = await this.buscarVariosMotivosService.execute(query);

    return { response: this.montarResponse(resultado) };
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiOperation({
    summary: 'Lista os motivos disponíveis para a filial do usuário',
    description:
      'Exclusivo para admin de filial. A filial é obtida do vínculo do usuário autenticado. Retorna os motivos da filial somados aos globais. Filtra por nome e tipo.',
  })
  async buscarVariosDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarMotivosQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<MotivoDto>>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosMotivosService.execute({
      ...query,
      filialId,
    });

    return { response: this.montarResponse(resultado) };
  }

  private montarResponse(
    resultado: PaginatedResponseInterface<Motivo>,
  ): PaginatedResponseInterface<MotivoDto> {
    return {
      totalCount: resultado.totalCount,
      hasNextPage: resultado.hasNextPage,
      data: resultado.data.map((motivo) => new MotivoDto(motivo)),
    };
  }
}
