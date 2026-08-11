import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarFilialService } from '../services/buscar-filial.service';
import { FilialDto } from './dtos/response/filial.dto';

@ApiTags('Filial')
@Controller()
export class BuscarFilialController {
  constructor(private readonly buscarFilialService: BuscarFilialService) {}

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.buscarFilialService.execute(id);

    return {
      response: FilialDto.aPartirDoDominio(filial),
    };
  }
}
