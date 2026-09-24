import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<MotivoDto>> {
    const motivo = await this.buscarMotivoService.execute(id);

    return { response: new MotivoDto(motivo) };
  }

  @Get('filial/:id')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
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
