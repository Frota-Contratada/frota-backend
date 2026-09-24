import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { AtualizarMotivoService } from '../services/atualizar-motivo.service';
import { AtualizarMotivoRequestDto } from './dtos/request/atualizar-motivo-request.dto';
import { MotivoDto } from './dtos/response/motivo.dto';

@ApiTags('Motivo')
@ApiBearerAuth()
@Controller()
export class AtualizarMotivoController {
  constructor(
    private readonly atualizarMotivoService: AtualizarMotivoService,
  ) {}

  @Patch('admin/:id')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async atualizar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: AtualizarMotivoRequestDto,
  ): Promise<ResponseInterface<MotivoDto>> {
    const motivo = await this.atualizarMotivoService.execute(
      id,
      body.nome,
      body.tipo,
    );

    return { response: new MotivoDto(motivo) };
  }

  @Patch('filial/:id')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async atualizarDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: AtualizarMotivoRequestDto,
  ): Promise<ResponseInterface<MotivoDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const motivo = await this.atualizarMotivoService.execute(
      id,
      body.nome,
      body.tipo,
      filialId,
    );

    return { response: new MotivoDto(motivo) };
  }
}
