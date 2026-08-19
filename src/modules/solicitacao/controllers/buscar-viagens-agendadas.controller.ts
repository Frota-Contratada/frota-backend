import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarViagensAgendadasService } from '../services/buscar-viagens-agendadas.service';
import { BuscarViagensAgendadasQueryDto } from './dtos/request/buscar-viagens-agendadas-query.dto';
import { ViagemAgendadaDto } from './dtos/response/viagem-agendada.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarViagensAgendadasController {
  constructor(
    private readonly buscarViagensAgendadasService: BuscarViagensAgendadasService,
  ) {}

  @Get('viagens')
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiOperation({
    summary: 'Lista as viagens aprovadas do solicitante em um período',
    description:
      'Alimenta a agenda da semana na home do passageiro. Traz apenas solicitações aprovadas com corrida marcada no intervalo.',
  })
  @ApiRespostaListaDe(ViagemAgendadaDto)
  async handle(
    @CurrentUser('id') solicitanteId: number,
    @Query() query: BuscarViagensAgendadasQueryDto,
  ): Promise<ResponseInterface<ViagemAgendadaDto[]>> {
    const viagens = await this.buscarViagensAgendadasService.execute(
      solicitanteId,
      DateTime.fromISO(query.inicio),
      DateTime.fromISO(query.fim),
    );

    return {
      response: viagens.map((viagem) =>
        ViagemAgendadaDto.aPartirDoDominio(viagem),
      ),
    };
  }
}
