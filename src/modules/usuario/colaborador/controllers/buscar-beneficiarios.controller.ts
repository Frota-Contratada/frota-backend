import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaPaginadaDe } from '@common/decorators/api-resposta.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { BuscarBeneficiariosService } from '../services/buscar-beneficiarios.service';
import { BuscarBeneficiariosQueryDto } from './dtos/request/buscar-beneficiarios-query.dto';
import { BeneficiarioDto } from './dtos/response/beneficiario.dto';

@ApiTags('Colaborador')
@ApiBearerAuth()
@Controller()
export class BuscarBeneficiariosController {
  constructor(private readonly service: BuscarBeneficiariosService) {}

  @Get('beneficiarios')
  @Perfis(
    TipoPerfil.SOLICITANTE,
    TipoPerfil.SOLICITANTE_EMERGENCIA,
    TipoPerfil.APROVADOR,
  )
  @ApiRespostaPaginadaDe(BeneficiarioDto)
  async handle(
    @CurrentUser('empresaId') empresaId: number | undefined,
    @CurrentUser('filialId') filialId: number | undefined,
    @Query() query: BuscarBeneficiariosQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<BeneficiarioDto>>> {
    if (!empresaId || !filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const resultado = await this.service.execute({
      ...query,
      empresaId,
      filialId,
    });

    return {
      response: {
        totalCount: resultado.totalCount,
        hasNextPage: resultado.hasNextPage,
        data: resultado.data.map((colaborador) =>
          BeneficiarioDto.aPartirDoDominio(colaborador),
        ),
      },
    };
  }
}
