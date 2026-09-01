import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { SimularSolicitacaoService } from '../services/simular-solicitacao.service';
import { SimularSolicitacaoRequestDto } from './dtos/request/simular-solicitacao-request.dto';
import { SimulacaoSolicitacaoDto } from './dtos/response/simulacao-solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class SimularSolicitacaoController {
  constructor(
    private readonly simularSolicitacaoService: SimularSolicitacaoService,
  ) {}

  @Post('simulacao')
  @HttpCode(HttpStatus.OK)
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiOperation({
    summary: 'Estima distância, duração e valor de uma corrida',
    description:
      'Aplica as mesmas regras da criação sem gravar nada, para o app mostrar o valor e o horário de chegada antes de o solicitante confirmar.',
  })
  @ApiRespostaDe(SimulacaoSolicitacaoDto)
  async handle(
    @CurrentUser('id') solicitanteId: number,
    @Body() body: SimularSolicitacaoRequestDto,
  ): Promise<ResponseInterface<SimulacaoSolicitacaoDto>> {
    const simulacao = await this.simularSolicitacaoService.execute({
      solicitanteId,
      dataCorrida: DateTime.fromISO(body.dataCorrida),
      tipoCorridaId: body.tipoCorridaId,
      tipoVeiculoId: body.tipoVeiculoId,
      cpfsAcompanhantes: body.cpfsAcompanhantes,
      origem: body.origem,
      destino: body.destino,
      paradas: body.paradas,
    });

    return { response: SimulacaoSolicitacaoDto.aPartirDoDominio(simulacao) };
  }
}
