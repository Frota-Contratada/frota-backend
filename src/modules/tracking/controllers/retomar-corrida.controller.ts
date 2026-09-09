import { Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { RetomarCorridaService } from '../services/retomar-corrida.service';
import { EsperaDto } from './dtos/response/espera.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class RetomarCorridaController {
  constructor(private readonly retomarCorridaService: RetomarCorridaService) {}

  @Post(':id/waiting/resume')
  @ApiOperation({ summary: 'Retoma a corrida após uma espera' })
  @ApiRespostaDe(EsperaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Headers('idempotency-key') chaveIdempotencia: string,
  ): Promise<ResponseInterface<EsperaDto>> {
    return {
      response: await this.retomarCorridaService.execute(
        corridaId,
        usuario,
        chaveIdempotencia,
      ),
    };
  }
}
