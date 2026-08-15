import { Controller, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Transacional } from '@core/prisma/decorators/transacional.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { TornarSolicitanteEmergenciaService } from '../services/tornar-solicitante-emergencia.service';
import { ColaboradorDto } from './dtos/response/colaborador.dto';

const idParamPipe = new ZodValidationPipe(z.coerce.number().int().positive());

@ApiTags('Colaborador')
@ApiBearerAuth()
@Controller()
export class TornarSolicitanteEmergenciaController {
  constructor(
    private readonly tornarSolicitanteEmergenciaService: TornarSolicitanteEmergenciaService,
  ) {}

  @Put(':id/perfis/solicitante-emergencia')
  @Perfis(TipoPerfil.ADMIN_MASTER, TipoPerfil.ADMIN_FILIAL)
  @Transacional()
  async handle(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Param('id', idParamPipe) id: number,
  ): Promise<ResponseInterface<ColaboradorDto>> {
    const colaborador = await this.tornarSolicitanteEmergenciaService.execute({
      colaboradorId: id,
      filialId: usuarioAtual.perfis.includes(TipoPerfil.ADMIN_MASTER)
        ? undefined
        : usuarioAtual.filialId,
    });

    return { response: new ColaboradorDto(colaborador) };
  }
}
