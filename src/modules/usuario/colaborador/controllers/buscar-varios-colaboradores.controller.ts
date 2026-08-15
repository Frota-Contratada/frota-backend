import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { ColaboradorSummary } from '../domain/types/colaborador-summary.type';
import { BuscarBigNumbersColaboradoresService } from '../services/buscar-big-numbers-colaboradores.service';
import { BuscarVariosColaboradoresService } from '../services/buscar-varios-colaboradores.service';
import { BigNumbersColaboradoresAdminQueryDto } from './dtos/request/big-numbers-colaboradores-admin-query.dto';
import { BigNumbersColaboradoresQueryDto } from './dtos/request/big-numbers-colaboradores-query.dto';
import { BuscarColaboradoresAdminQueryDto } from './dtos/request/buscar-colaboradores-admin-query.dto';
import { BuscarColaboradoresQueryDto } from './dtos/request/buscar-colaboradores-query.dto';
import { ColaboradorBigNumbersDto } from './dtos/response/colaborador-big-numbers.dto';
import { ColaboradorSummaryDto } from './dtos/response/colaborador-summary.dto';

@ApiTags('Colaborador')
@ApiBearerAuth()
@Controller()
export class BuscarVariosColaboradoresController {
  constructor(
    private readonly buscarVariosColaboradoresService: BuscarVariosColaboradoresService,
    private readonly buscarBigNumbersColaboradoresService: BuscarBigNumbersColaboradoresService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarVarios(
    @Query() query: BuscarColaboradoresAdminQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<ColaboradorSummaryDto>>
  > {
    const resultado =
      await this.buscarVariosColaboradoresService.execute(query);

    return { response: this.montarResponse(resultado) };
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarVariosDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarColaboradoresQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<ColaboradorSummaryDto>>
  > {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosColaboradoresService.execute({
      ...query,
      filialId,
    });

    return { response: this.montarResponse(resultado) };
  }

  @Get('admin/big-numbers')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarBigNumbers(
    @Query() query: BigNumbersColaboradoresAdminQueryDto,
  ): Promise<ResponseInterface<ColaboradorBigNumbersDto>> {
    const resultado =
      await this.buscarBigNumbersColaboradoresService.execute(query);

    return { response: new ColaboradorBigNumbersDto(resultado) };
  }

  @Get('filial/big-numbers')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarBigNumbersDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BigNumbersColaboradoresQueryDto,
  ): Promise<ResponseInterface<ColaboradorBigNumbersDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarBigNumbersColaboradoresService.execute({
      ...query,
      filialId,
    });

    return { response: new ColaboradorBigNumbersDto(resultado) };
  }

  private montarResponse(
    resultado: PaginatedResponseInterface<ColaboradorSummary>,
  ): PaginatedResponseInterface<ColaboradorSummaryDto> {
    return {
      totalCount: resultado.totalCount,
      hasNextPage: resultado.hasNextPage,
      data: resultado.data.map(
        (colaborador) => new ColaboradorSummaryDto(colaborador),
      ),
    };
  }
}
