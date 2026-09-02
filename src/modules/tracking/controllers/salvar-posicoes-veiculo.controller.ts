import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { SalvarPosicoesVeiculoService } from '../services/salvar-posicoes-veiculo.service';
import { SalvarPosicoesVeiculoRequestDto } from './dtos/request/salvar-posicoes-veiculo-request.dto';
import { PosicaoAceitaDto } from './dtos/response/posicao-aceita.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class SalvarPosicoesVeiculoController {
  constructor(
    private readonly salvarPosicoesVeiculoService: SalvarPosicoesVeiculoService,
  ) {}

  @Post(':id/tracking/positions/batch')
  @ApiOperation({ summary: 'Persiste um lote offline de posições do veículo' })
  @ApiRespostaDe(PosicaoAceitaDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
    @Body() body: SalvarPosicoesVeiculoRequestDto,
  ): Promise<ResponseInterface<PosicaoAceitaDto>> {
    const accepted = await this.salvarPosicoesVeiculoService.execute(
      corridaId,
      usuario,
      body.positions,
    );
    return { response: { accepted } };
  }
}
