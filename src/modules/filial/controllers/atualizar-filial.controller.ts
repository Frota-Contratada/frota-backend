import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { AtualizarFilialService } from '../services/atualizar-filial.service';
import { AtualizarFilialRequestDto } from './dtos/request/atualizar-filial-request.dto';
import { EnderecoDto, FilialDto } from './dtos/response/filial.dto';

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
    @Body() body: AtualizarFilialRequestDto,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.atualizarFilialService.executar(
      id,
      body.nome,
      body.endereco,
    );

    const endereco = new EnderecoDto(
      filial.endereco.logradouro,
      filial.endereco.numero,
      filial.endereco.bairro,
      filial.endereco.cidade,
      filial.endereco.uf,
      filial.endereco.cep,
      filial.endereco.latitude,
      filial.endereco.longitude,
      filial.endereco.complemento,
    );

    return {
      response: new FilialDto(filial.id, filial.nome, filial.cnpj, endereco),
    };
  }
}
