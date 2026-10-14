import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CancelarCorridaService } from '../services/cancelar-corrida.service';
import { CancelarCorridaRequestDto } from './dtos/request/cancelar-corrida-request.dto';
import { CorridaDto } from './dtos/response/corrida.dto';

@ApiTags('Corrida')
@ApiBearerAuth()
@Controller('corridas')
export class CancelarCorridaController {
  constructor(
    private readonly cancelarCorridaService: CancelarCorridaService,
  ) {}

  @Patch(':id/cancelamento')
  @Perfis(
    TipoPerfil.SOLICITANTE,
    TipoPerfil.SOLICITANTE_EMERGENCIA,
    TipoPerfil.MOTORISTA,
  )
  async cancelar(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: CancelarCorridaRequestDto,
  ): Promise<ResponseInterface<CorridaDto>> {
    return {
      response: await this.cancelarCorridaService.execute(
        id,
        usuario,
        body.motivoCancelamentoId,
      ),
    };
  }
}
