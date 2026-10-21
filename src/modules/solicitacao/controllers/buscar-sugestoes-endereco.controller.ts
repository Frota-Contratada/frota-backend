import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarSugestoesEnderecoService } from '../services/buscar-sugestoes-endereco.service';
import { BuscarSugestoesEnderecoQueryDto } from './dtos/request/buscar-sugestoes-endereco-query.dto';
import { SugestaoEnderecoDto } from './dtos/response/sugestao-endereco.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarSugestoesEnderecoController {
  constructor(private readonly service: BuscarSugestoesEnderecoService) {}

  @Get('enderecos/sugestoes')
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiRespostaListaDe(SugestaoEnderecoDto)
  async handle(
    @Query() query: BuscarSugestoesEnderecoQueryDto,
  ): Promise<ResponseInterface<SugestaoEnderecoDto[]>> {
    const proximoDe =
      query.latitude == null || query.longitude == null
        ? undefined
        : { latitude: query.latitude, longitude: query.longitude };
    const sugestoes = await this.service.execute(query.busca, proximoDe);

    return {
      response: sugestoes.map((sugestao) => new SugestaoEnderecoDto(sugestao)),
    };
  }
}
