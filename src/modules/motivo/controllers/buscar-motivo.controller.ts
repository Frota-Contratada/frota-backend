import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { BuscarMotivoService } from '../services/buscar-motivo.service';
import { MotivoDto } from './dtos/response/motivo.dto';

@ApiTags('Motivo')
@ApiBearerAuth()
@Controller()
export class BuscarMotivoController {
  constructor(private readonly buscarMotivoService: BuscarMotivoService) {}

  @Get('admin/:id')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiOperation({
    summary: 'Busca um motivo por id',
    description:
      'Exclusivo para admin master. Alcança motivos de qualquer escopo.',
  })
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<MotivoDto>> {
    const motivo = await this.buscarMotivoService.execute(id);

    return { response: new MotivoDto(motivo) };
  }

  @Get('filial/:id')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiOperation({
    summary: 'Busca um motivo disponível para a filial do usuário',
    description:
      'Exclusivo para admin de filial. Alcança os motivos da própria filial e os globais.',
  })
  async buscarDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<MotivoDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    const motivo = await this.buscarMotivoService.execute(id, filialId);

    return { response: new MotivoDto(motivo) };
  }
}
