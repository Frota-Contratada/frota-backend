import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import {
  ApiRespostaDe,
  ApiRespostaPaginadaDe,
} from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarVariosVeiculosService } from '../services/buscar-varios-veiculos.service';
import { BuscarVeiculoService } from '../services/buscar-veiculo.service';
import {
  BuscarVeiculoQueryDto,
  BuscarVeiculosQueryDto,
} from './dtos/request/buscar-veiculos-query.dto';
import { VeiculoDto } from './dtos/response/veiculo.dto';

@ApiTags('Veículo')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.ADMIN_FORNECEDOR, TipoPerfil.ADMIN_FILIAL)
export class BuscarVeiculosController {
  constructor(
    private readonly buscarVariosVeiculosService: BuscarVariosVeiculosService,
    private readonly buscarVeiculoService: BuscarVeiculoService,
  ) {}

  @Get()
  @ApiRespostaPaginadaDe(VeiculoDto)
  async buscarVarios(
    @CurrentUser() usuario: AuthenticatedUser,
    @Query() query: BuscarVeiculosQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<VeiculoDto>>> {
    const resultado = await this.buscarVariosVeiculosService.execute(usuario, {
      fornecedorId: query.fornecedorId,
      placa: query.placa,
      ativo: query.ativo,
      page: query.page,
      limit: query.limit,
    });

    return {
      response: {
        totalCount: resultado.totalCount,
        hasNextPage: resultado.hasNextPage,
        data: resultado.data.map((veiculo) =>
          VeiculoDto.aPartirDoDominio(veiculo),
        ),
      },
    };
  }

  @Get(':id')
  @ApiRespostaDe(VeiculoDto)
  async buscar(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Query() query: BuscarVeiculoQueryDto,
  ): Promise<ResponseInterface<VeiculoDto>> {
    const veiculo = await this.buscarVeiculoService.execute(
      usuario,
      id,
      query.fornecedorId,
    );

    return { response: VeiculoDto.aPartirDoDominio(veiculo) };
  }
}
