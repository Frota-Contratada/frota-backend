import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { ContratoSummary } from '../domain/types/contrato-summary.type';
import { BuscarBigNumbersContratosService } from '../services/buscar-big-numbers-contratos.service';
import { BuscarVariosContratosService } from '../services/buscar-varios-contratos.service';
import { BigNumbersContratosAdminQueryDto } from './dtos/request/big-numbers-contratos-admin-query.dto';
import { BigNumbersContratosQueryDto } from './dtos/request/big-numbers-contratos-query.dto';
import { BuscarContratosAdminQueryDto } from './dtos/request/buscar-contratos-admin-query.dto';
import { BuscarContratosQueryDto } from './dtos/request/buscar-contratos-query.dto';
import { ContratoBigNumbersDto } from './dtos/response/contrato-big-numbers.dto';
import { ContratoSummaryDto } from './dtos/response/contrato-summary.dto';

@ApiTags('Contrato')
@ApiBearerAuth()
@Controller()
export class BuscarVariosContratosController {
  constructor(
    private readonly buscarVariosContratosService: BuscarVariosContratosService,
    private readonly buscarBigNumbersContratosService: BuscarBigNumbersContratosService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarVarios(
    @Query() query: BuscarContratosAdminQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<ContratoSummaryDto>>
  > {
    const resultado = await this.buscarVariosContratosService.execute(query);

    return { response: this.montarResponse(resultado) };
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarVariosDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarContratosQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<ContratoSummaryDto>>
  > {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosContratosService.execute({
      ...query,
      filialId,
    });

    return { response: this.montarResponse(resultado) };
  }

  @Get('admin/big-numbers')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarBigNumbers(
    @Query() query: BigNumbersContratosAdminQueryDto,
  ): Promise<ResponseInterface<ContratoBigNumbersDto>> {
    const resultado =
      await this.buscarBigNumbersContratosService.execute(query);

    return { response: new ContratoBigNumbersDto(resultado) };
  }

  @Get('filial/big-numbers')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarBigNumbersDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BigNumbersContratosQueryDto,
  ): Promise<ResponseInterface<ContratoBigNumbersDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarBigNumbersContratosService.execute({
      ...query,
      filialId,
    });

    return { response: new ContratoBigNumbersDto(resultado) };
  }

  private montarResponse(
    resultado: PaginatedResponseInterface<ContratoSummary>,
  ): PaginatedResponseInterface<ContratoSummaryDto> {
    return {
      totalCount: resultado.totalCount,
      hasNextPage: resultado.hasNextPage,
      data: resultado.data.map((contrato) => new ContratoSummaryDto(contrato)),
    };
  }
}
