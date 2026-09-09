import { Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { ConcluirParadaService } from '../services/concluir-parada.service';
import { ParadaConcluidaDto } from './dtos/response/parada-concluida.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class ConcluirParadaController {
  constructor(private readonly concluirParadaService: ConcluirParadaService) {}

  @Post(':id/stops/:sequence/complete')
  @ApiOperation({ summary: 'Marca uma parada como concluída pelo motorista' })
  @ApiRespostaDe(ParadaConcluidaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @Param(
      'sequence',
      new ZodValidationPipe(z.coerce.number().int().positive()),
    )
    sequencia: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Headers('idempotency-key') chaveIdempotencia: string,
  ): Promise<ResponseInterface<ParadaConcluidaDto>> {
    return {
      response: await this.concluirParadaService.execute(
        corridaId,
        sequencia,
        usuario,
        chaveIdempotencia,
      ),
    };
  }
}
