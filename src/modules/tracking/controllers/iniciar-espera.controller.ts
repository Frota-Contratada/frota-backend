import { Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { IniciarEsperaService } from '../services/iniciar-espera.service';
import { EsperaDto } from './dtos/response/espera.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class IniciarEsperaController {
  constructor(private readonly iniciarEsperaService: IniciarEsperaService) {}

  @Post(':id/waiting/start')
  @ApiOperation({ summary: 'Inicia a espera da corrida' })
  @ApiRespostaDe(EsperaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Headers('idempotency-key') chaveIdempotencia: string,
  ): Promise<ResponseInterface<EsperaDto>> {
    return {
      response: await this.iniciarEsperaService.execute(
        corridaId,
        usuario,
        chaveIdempotencia,
      ),
    };
  }
}
