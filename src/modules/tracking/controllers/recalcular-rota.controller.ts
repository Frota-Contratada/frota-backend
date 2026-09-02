import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { RecalcularRotaService } from '../services/recalcular-rota.service';
import { RecalcularRotaRequestDto } from './dtos/request/recalcular-rota-request.dto';
import { RotaCanonicaDto } from './dtos/response/rota-canonica.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class RecalcularRotaController {
  constructor(private readonly recalcularRotaService: RecalcularRotaService) {}

  @Post(':id/route/reroute')
  @ApiOperation({ summary: 'Recalcula a rota da corrida' })
  @ApiRespostaDe(RotaCanonicaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Headers('idempotency-key') chaveIdempotencia: string,
    @Body() body: RecalcularRotaRequestDto,
  ): Promise<ResponseInterface<RotaCanonicaDto>> {
    return {
      response: await this.recalcularRotaService.execute(
        corridaId,
        usuario,
        chaveIdempotencia,
        body.position,
      ),
    };
  }
}
