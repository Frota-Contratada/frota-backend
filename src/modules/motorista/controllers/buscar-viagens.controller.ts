import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { fusoHorarioOperacao } from '@common/config/fuso-horario';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarViagensService } from '../services/buscar-viagens.service';
import { BuscarViagensQueryDto } from './dtos/request/buscar-viagens-query.dto';
import { MotoristaCorridaDto } from './dtos/response/motorista-corrida.dto';

@ApiTags('Motorista')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.MOTORISTA)
export class BuscarViagensController {
  constructor(private readonly buscarViagensService: BuscarViagensService) {}

  @Get('viagens')
  async buscarViagens(
    @CurrentUser('id') motoristaId: number,
    @Query() query: BuscarViagensQueryDto,
  ): Promise<ResponseInterface<MotoristaCorridaDto[]>> {
    const viagens = await this.buscarViagensService.execute(
      motoristaId,
      DateTime.fromISO(query.inicio, { zone: fusoHorarioOperacao() }),
      DateTime.fromISO(query.fim, { zone: fusoHorarioOperacao() }),
    );

    return {
      response: viagens.map((viagem) => new MotoristaCorridaDto(viagem)),
    };
  }
}
