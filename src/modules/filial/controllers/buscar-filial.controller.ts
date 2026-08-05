import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarFilialService } from '../services/buscar-filial.service';
import { BuscarFiliaisQueryDto } from './dtos/request/buscar-filiais-query.dto';
import { EnderecoDto, FilialDto } from './dtos/response/filial.dto';
import { Filial } from '../domain/filial';

const toFilialDto = (filial: Filial): FilialDto => {
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

  return new FilialDto(filial.id, filial.nome, filial.cnpj, endereco);
};

@ApiTags('Filial')
@Controller()
export class BuscarFilialController {
  constructor(private readonly buscarFilialService: BuscarFilialService) {}

  @Get()
  async buscarVarios(
    @Query() query: BuscarFiliaisQueryDto,
  ): Promise<ResponseInterface<FilialDto[]>> {
    const filiais = await this.buscarFilialService.executarVarios(query);

    return {
      response: filiais.map(toFilialDto),
    };
  }

  @Get(':id')
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.buscarFilialService.executar(id);

    return {
      response: toFilialDto(filial),
    };
  }
}
