import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarCorridaService } from '../services/buscar-corrida.service';
import { BuscarPerfilService } from '../services/buscar-perfil.service';
import { BuscarViagensService } from '../services/buscar-viagens.service';
import { IniciarCorridaService } from '../services/iniciar-corrida.service';
import { BuscarViagensQueryDto } from './dtos/request/buscar-viagens-query.dto';
import { MotoristaCorridaDto } from './dtos/response/motorista-corrida.dto';
import { MotoristaPerfilDto } from './dtos/response/motorista-perfil.dto';

@ApiTags('Motorista')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.MOTORISTA)
export class MotoristaController {
  constructor(
    private readonly buscarViagensService: BuscarViagensService,
    private readonly buscarCorridaService: BuscarCorridaService,
    private readonly iniciarCorridaService: IniciarCorridaService,
    private readonly buscarPerfilService: BuscarPerfilService,
  ) {}

  @Get('viagens')
  @ApiOperation({
    summary: 'Lista as corridas do motorista no período informado',
  })
  async buscarViagens(
    @CurrentUser('id') motoristaId: number,
    @Query() query: BuscarViagensQueryDto,
  ): Promise<ResponseInterface<MotoristaCorridaDto[]>> {
    const viagens = await this.buscarViagensService.execute(
      motoristaId,
      DateTime.fromISO(query.inicio),
      DateTime.fromISO(query.fim),
    );

    return {
      response: viagens.map((viagem) => new MotoristaCorridaDto(viagem)),
    };
  }

  @Get('corridas/:id')
  async buscarCorrida(
    @CurrentUser('id') motoristaId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
  ): Promise<ResponseInterface<MotoristaCorridaDto>> {
    const corrida = await this.buscarCorridaService.execute(
      corridaId,
      motoristaId,
    );

    return { response: new MotoristaCorridaDto(corrida) };
  }

  @Post('corridas/:id/iniciar')
  async iniciarCorrida(
    @CurrentUser('id') motoristaId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
  ): Promise<ResponseInterface<MotoristaCorridaDto>> {
    const corrida = await this.iniciarCorridaService.execute(
      corridaId,
      motoristaId,
    );

    return { response: new MotoristaCorridaDto(corrida) };
  }

  @Get('perfil')
  async buscarPerfil(
    @CurrentUser('id') motoristaId: number,
  ): Promise<ResponseInterface<MotoristaPerfilDto>> {
    const perfil = await this.buscarPerfilService.execute(motoristaId);
    return { response: new MotoristaPerfilDto(perfil) };
  }
}
