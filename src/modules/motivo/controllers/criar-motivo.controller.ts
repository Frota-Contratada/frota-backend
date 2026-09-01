import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { CriarMotivoService } from '../services/criar-motivo.service';
import { CriarMotivoAdminRequestDto } from './dtos/request/criar-motivo-admin-request.dto';
import { CriarMotivoRequestDto } from './dtos/request/criar-motivo-request.dto';
import { MotivoDto } from './dtos/response/motivo.dto';

@ApiTags('Motivo')
@ApiBearerAuth()
@Controller()
export class CriarMotivoController {
  constructor(private readonly criarMotivoService: CriarMotivoService) {}

  @Post('admin')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiOperation({
    summary: 'Cria um motivo global ou de uma filial específica',
    description:
      'Exclusivo para admin master. Sem filialId o motivo é global e fica disponível para todas as filiais. Com filialId o motivo pertence apenas àquela filial.',
  })
  async criar(
    @Body() body: CriarMotivoAdminRequestDto,
  ): Promise<ResponseInterface<MotivoDto>> {
    const motivo = await this.criarMotivoService.execute(
      body.nome,
      body.tipo,
      body.filialId ?? undefined,
    );

    return { response: new MotivoDto(motivo) };
  }

  @Post('filial')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiOperation({
    summary: 'Cria um motivo para a filial do usuário',
    description:
      'Exclusivo para admin de filial. A filial é obtida do vínculo do usuário autenticado, não do corpo da requisição.',
  })
  async criarNaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Body() body: CriarMotivoRequestDto,
  ): Promise<ResponseInterface<MotivoDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const motivo = await this.criarMotivoService.execute(
      body.nome,
      body.tipo,
      filialId,
    );

    return { response: new MotivoDto(motivo) };
  }
}
