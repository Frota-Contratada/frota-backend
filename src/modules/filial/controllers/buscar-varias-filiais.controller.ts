import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { BuscarVariasFiliaisService } from '../services/buscar-varias-filiais.service';
import { BuscarVariasFiliaisQueryDto } from './dtos/request/buscar-varias-filiais-query.dto';
import { FilialDto } from './dtos/response/filial.dto';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

@ApiTags('Filial')
@Controller()
export class BuscarVariasFiliaisController {
  constructor(
    private readonly buscarVariasFiliaisService: BuscarVariasFiliaisService,
  ) {}

  @Get()
  @Perfis(
    TipoPerfil.ADMIN_MASTER,
    TipoPerfil.ADMIN_FILIAL,
    TipoPerfil.APROVADOR,
  )
  async handle(
    @Query() query: BuscarVariasFiliaisQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<FilialDto>>> {
    const resultado = await this.buscarVariasFiliaisService.execute(query);

    return {
      response: {
        totalCount: resultado.totalCount,
        hasNextPage: resultado.hasNextPage,
        data: resultado.data.map((filial) =>
          FilialDto.aPartirDoDominio(filial),
        ),
      },
    };
  }
}
