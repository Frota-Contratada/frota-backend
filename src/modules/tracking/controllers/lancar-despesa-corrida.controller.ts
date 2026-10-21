import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { LancarDespesaCorridaService } from '../services/lancar-despesa-corrida.service';
import { LancarDespesaRequestDto } from './dtos/request/lancar-despesa-request.dto';
import { DespesaDto } from './dtos/response/despesa.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class LancarDespesaCorridaController {
  constructor(
    private readonly lancarDespesaCorridaService: LancarDespesaCorridaService,
  ) {}

  @Post(':id/despesas')
  @ApiRespostaDe(DespesaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Body() body: LancarDespesaRequestDto,
  ): Promise<ResponseInterface<DespesaDto>> {
    return {
      response: await this.lancarDespesaCorridaService.execute(
        corridaId,
        usuario,
        { tipo: body.tipo, valor: body.valor },
      ),
    };
  }
}
