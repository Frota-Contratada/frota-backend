import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CriarFilialRequestDto } from './dtos/request/criar-filial-request.dto';
import { EnderecoDto, FilialDto } from './dtos/response/filial.dto';
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

    const enderecoDto = new EnderecoDto(
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

    const response = new FilialDto(
      filial.id,
      filial.nome,
      filial.cnpj,
      enderecoDto,
    );

    return { response };
  }
}
