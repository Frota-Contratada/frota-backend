import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarMotoristaService } from '../services/buscar-motorista.service';
import { BuscarVariosMotoristasService } from '../services/buscar-varios-motoristas.service';
import { BuscarMotoristasQueryDto } from './dtos/request/buscar-motoristas-query.dto';
import { MotoristaDto } from './dtos/response/motorista.dto';

@ApiTags('Motorista')
@Controller()
export class BuscarMotoristaController {
  constructor(
    private readonly buscarMotoristaService: BuscarMotoristaService,
    private readonly buscarVariosMotoristasService: BuscarVariosMotoristasService,
  ) {}

  @Get()
  async buscarVarios(
    @Query() query: BuscarMotoristasQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<MotoristaDto>>> {
    const resultado = await this.buscarVariosMotoristasService.execute(query);

    return {
      response: {
        totalCount: resultado.totalCount,
        hasNextPage: resultado.hasNextPage,
        data: resultado.data.map(
          (motorista) =>
            new MotoristaDto(
              motorista.id,
              motorista.nome,
              motorista.email,
              motorista.cpf,
              motorista.fornecedorId,
            ),
        ),
      },
    };
  }

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<MotoristaDto>> {
    const motorista = await this.buscarMotoristaService.execute(id);

    return {
      response: new MotoristaDto(
        motorista.id,
        motorista.nome,
        motorista.email,
        motorista.cpf,
        motorista.fornecedorId,
      ),
    };
  }
}
