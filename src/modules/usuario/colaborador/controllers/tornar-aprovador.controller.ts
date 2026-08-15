import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Transacional } from '@core/prisma/decorators/transacional.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { TornarAprovadorService } from '../services/tornar-aprovador.service';
import { VincularCentroCustoRequestDto } from './dtos/request/vincular-centro-custo-request.dto';
import { ColaboradorDto } from './dtos/response/colaborador.dto';

const idParamPipe = new ZodValidationPipe(z.coerce.number().int().positive());

@ApiTags('Colaborador')
@ApiBearerAuth()
@Controller()
export class TornarAprovadorController {
  constructor(
    private readonly tornarAprovadorService: TornarAprovadorService,
  ) {}

  @Put(':id/perfis/aprovador')
  @Perfis(TipoPerfil.ADMIN_MASTER, TipoPerfil.ADMIN_FILIAL)
  @Transacional()
  async handle(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Param('id', idParamPipe) id: number,
    @Body() body: VincularCentroCustoRequestDto,
  ): Promise<ResponseInterface<ColaboradorDto>> {
    const colaborador = await this.tornarAprovadorService.execute({
      colaboradorId: id,
      centroCustoId: body.centroCustoId,
      filialId: usuarioAtual.perfis.includes(TipoPerfil.ADMIN_MASTER)
        ? undefined
        : usuarioAtual.filialId,
    });

    return { response: new ColaboradorDto(colaborador) };
  }
}
