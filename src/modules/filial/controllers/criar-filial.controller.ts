import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CriarFilialRequestDto } from './dtos/request/criar-filial-request.dto';
import { FilialDto } from './dtos/response/filial.dto';
import { CriarFilialService } from '../services/criar-filial.service';

@ApiTags('Filial')
@Controller()
export class CriarFilialController {
  constructor(private readonly criarFilialService: CriarFilialService) {}

  @Post()
  async handle(
    @Body() body: CriarFilialRequestDto,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.criarFilialService.execute(
      body.nome,
      body.cnpj,
      body.administradorId,
      body.endereco,
    );

    return { response: FilialDto.aPartirDoDominio(filial) };
  }
}
