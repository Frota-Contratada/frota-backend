import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { FornecedorSummary } from '../domain/types/fornecedor-summary.type';
import { BuscarBigNumbersFornecedoresService } from '../services/buscar-big-numbers-fornecedores.service';
import { BuscarVariosFornecedoresService } from '../services/buscar-varios-fornecedores.service';
import { BigNumbersFornecedoresAdminQueryDto } from './dtos/request/big-numbers-fornecedores-admin-query.dto';
import { BigNumbersFornecedoresQueryDto } from './dtos/request/big-numbers-fornecedores-query.dto';
import { BuscarFornecedoresAdminQueryDto } from './dtos/request/buscar-fornecedores-admin-query.dto';
import { BuscarFornecedoresQueryDto } from './dtos/request/buscar-fornecedores-query.dto';
import { FornecedorBigNumbersDto } from './dtos/response/fornecedor-big-numbers.dto';
import { FornecedorSummaryDto } from './dtos/response/fornecedor-summary.dto';

@ApiTags('Fornecedor')
@ApiBearerAuth()
@Controller()
export class BuscarVariosFornecedoresController {
  constructor(
    private readonly buscarVariosFornecedoresService: BuscarVariosFornecedoresService,
    private readonly buscarBigNumbersFornecedoresService: BuscarBigNumbersFornecedoresService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarVarios(
    @Query() query: BuscarFornecedoresAdminQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<FornecedorSummaryDto>>
  > {
    const resultado = await this.buscarVariosFornecedoresService.execute(query);

    return { response: this.montarResponse(resultado) };
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarVariosDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarFornecedoresQueryDto,
  ): Promise<
    ResponseInterface<PaginatedResponseInterface<FornecedorSummaryDto>>
  > {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosFornecedoresService.execute({
      ...query,
      filialId,
    });

    return { response: this.montarResponse(resultado) };
  }

  @Get('admin/big-numbers')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarBigNumbers(
    @Query() query: BigNumbersFornecedoresAdminQueryDto,
  ): Promise<ResponseInterface<FornecedorBigNumbersDto>> {
    const resultado =
      await this.buscarBigNumbersFornecedoresService.execute(query);

    return { response: new FornecedorBigNumbersDto(resultado) };
  }

  @Get('filial/big-numbers')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarBigNumbersDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BigNumbersFornecedoresQueryDto,
  ): Promise<ResponseInterface<FornecedorBigNumbersDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarBigNumbersFornecedoresService.execute({
      ...query,
      filialId,
    });

    return { response: new FornecedorBigNumbersDto(resultado) };
  }

  private montarResponse(
    resultado: PaginatedResponseInterface<FornecedorSummary>,
  ): PaginatedResponseInterface<FornecedorSummaryDto> {
    return {
      totalCount: resultado.totalCount,
      hasNextPage: resultado.hasNextPage,
      data: resultado.data.map(
        (fornecedor) => new FornecedorSummaryDto(fornecedor),
      ),
    };
  }
}
