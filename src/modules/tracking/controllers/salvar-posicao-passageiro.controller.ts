import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { SalvarPosicaoPassageiroService } from '../services/salvar-posicao-passageiro.service';
import { TrackingPositionRequestDto } from './dtos/request/tracking-position-request.dto';
import { PosicaoAceitaDto } from './dtos/response/posicao-aceita.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class SalvarPosicaoPassageiroController {
  constructor(
    private readonly salvarPosicaoPassageiroService: SalvarPosicaoPassageiroService,
  ) {}

  @Post(':id/tracking/passenger-position')
  @ApiOperation({ summary: 'Atualiza a posição auxiliar do passageiro' })
  @ApiRespostaDe(PosicaoAceitaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Body() body: TrackingPositionRequestDto,
  ): Promise<ResponseInterface<PosicaoAceitaDto>> {
    const accepted = await this.salvarPosicaoPassageiroService.execute(
      corridaId,
      usuario,
      body,
    );
    return { response: { accepted } };
  }
}
