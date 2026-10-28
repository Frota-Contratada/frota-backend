import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CriarFilialRequestDto } from './dtos/request/criar-filial-request.dto';
import { FilialDto } from './dtos/response/filial.dto';
import { CriarFilialService } from '../services/criar-filial.service';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

@ApiTags('Filial')
@Controller()
export class CriarFilialController {
  constructor(private readonly criarFilialService: CriarFilialService) {}

  @Post()
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async handle(
    @Body() body: CriarFilialRequestDto,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.criarFilialService.execute(
      body.empresaId,
      body.nome,
      body.cnpj,
      body.administradorId,
      body.endereco,
    );

    return { response: FilialDto.aPartirDoDominio(filial) };
  }
}
