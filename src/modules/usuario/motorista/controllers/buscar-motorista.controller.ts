import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarMotoristaService } from '../services/buscar-motorista.service';
import { BuscarMotoristasQueryDto } from './dtos/request/buscar-motoristas-query.dto';
import { MotoristaDto } from './dtos/response/motorista.dto';

@ApiTags('Motorista')
@Controller()
export class BuscarMotoristaController {
  constructor(
    private readonly buscarMotoristaService: BuscarMotoristaService,
  ) {}

  @Get()
  async buscarVarios(
    @Query() query: BuscarMotoristasQueryDto,
  ): Promise<ResponseInterface<MotoristaDto[]>> {
    const motoristas =
      await this.buscarMotoristaService.executarVarios(query);

    return {
      response: motoristas.map(
        (motorista) =>
          new MotoristaDto(
            motorista.id,
            motorista.nome,
            motorista.email,
            motorista.cpf,
            motorista.fornecedorId,
          ),
      ),
    };
  }

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<MotoristaDto>> {
    const motorista = await this.buscarMotoristaService.executar(id);

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
