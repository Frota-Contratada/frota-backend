import { Body, Controller, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { AtualizarFilialService } from '../services/atualizar-filial.service';
import { AtualizarFilialRequestDto } from './dtos/request/atualizar-filial-request.dto';
import { FilialDto } from './dtos/response/filial.dto';

@ApiTags('Filial')
@Controller()
export class AtualizarFilialController {
  constructor(
    private readonly atualizarFilialService: AtualizarFilialService,
  ) {}

  @Patch(':id')
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Query(
      'empresaId',
      new ZodValidationPipe(z.coerce.number().int().positive()),
    )
    empresaId: number,
    @Body() body: AtualizarFilialRequestDto,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.atualizarFilialService.execute(
      empresaId,
      id,
      body.nome,
      body.endereco,
    );

    return {
      response: FilialDto.aPartirDoDominio(filial),
    };
  }
}
