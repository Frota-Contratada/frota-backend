import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { BuscarVariasFiliaisService } from '../services/buscar-varias-filiais.service';
import { BuscarVariasFiliaisQueryDto } from './dtos/request/buscar-varias-filiais-query.dto';
import { FilialDto } from './dtos/response/filial.dto';

@ApiTags('Filial')
@Controller()
export class BuscarVariasFiliaisController {
  constructor(
    private readonly buscarVariasFiliaisService: BuscarVariasFiliaisService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista filiais',
    description:
      'Filtra por nome, CNPJ e endereço. O filtro de endereço busca o termo na cidade ou no bairro. Os filtros informados são combinados entre si.',
  })
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
