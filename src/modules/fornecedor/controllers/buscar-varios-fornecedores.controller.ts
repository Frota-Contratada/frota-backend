import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { Fornecedor } from '../domain/fornecedor';
import { BuscarVariosFornecedoresService } from '../services/buscar-varios-fornecedores.service';
import { BuscarFornecedoresAdminQueryDto } from './dtos/request/buscar-fornecedores-admin-query.dto';
import { BuscarFornecedoresQueryDto } from './dtos/request/buscar-fornecedores-query.dto';
import { FornecedorDto } from './dtos/response/fornecedor.dto';

@ApiTags('Fornecedor')
@ApiBearerAuth()
@Controller()
export class BuscarVariosFornecedoresController {
  constructor(
    private readonly buscarVariosFornecedoresService: BuscarVariosFornecedoresService,
  ) {}

  @Get('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async buscarVarios(
    @Query() query: BuscarFornecedoresAdminQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<FornecedorDto>>> {
    const resultado = await this.buscarVariosFornecedoresService.execute(query);

    return { response: this.montarResponse(resultado) };
  }

  @Get('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async buscarVariosDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarFornecedoresQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<FornecedorDto>>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.buscarVariosFornecedoresService.execute({
      ...query,
      filialId,
    });

    return { response: this.montarResponse(resultado) };
  }

  private montarResponse(
    resultado: PaginatedResponseInterface<Fornecedor>,
  ): PaginatedResponseInterface<FornecedorDto> {
    return {
      totalCount: resultado.totalCount,
      hasNextPage: resultado.hasNextPage,
      data: resultado.data.map(
        (fornecedor) =>
          new FornecedorDto(fornecedor.id, fornecedor.nome, fornecedor.cnpjCpf),
      ),
    };
  }
}
