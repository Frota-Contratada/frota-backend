import { Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { FinalizarCorridaService } from '../services/finalizar-corrida.service';
import { CorridaFinalizadaDto } from './dtos/response/corrida-finalizada.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class FinalizarCorridaController {
  constructor(
    private readonly finalizarCorridaService: FinalizarCorridaService,
  ) {}

  @Post(':id/finish')
  @ApiOperation({ summary: 'Finaliza a corrida' })
  @ApiRespostaDe(CorridaFinalizadaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Headers('idempotency-key') chaveIdempotencia: string,
  ): Promise<ResponseInterface<CorridaFinalizadaDto>> {
    return {
      response: await this.finalizarCorridaService.execute(
        corridaId,
        usuario,
        chaveIdempotencia,
      ),
    };
  }
}
