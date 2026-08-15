import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarPerfisDoColaboradorService } from '../services/buscar-perfis-do-colaborador.service';
import { PerfisDoColaboradorDto } from './dtos/response/perfis-do-colaborador.dto';

const idParamPipe = new ZodValidationPipe(z.coerce.number().int().positive());

@ApiTags('Colaborador')
@ApiBearerAuth()
@Controller()
export class BuscarPerfisDoColaboradorController {
  constructor(
    private readonly buscarPerfisDoColaboradorService: BuscarPerfisDoColaboradorService,
  ) {}

  @Get(':id/perfis')
  async handle(
    @Param('id', idParamPipe) id: number,
  ): Promise<ResponseInterface<PerfisDoColaboradorDto>> {
    const colaborador = await this.buscarPerfisDoColaboradorService.execute(id);

    return { response: new PerfisDoColaboradorDto(colaborador) };
  }
}
