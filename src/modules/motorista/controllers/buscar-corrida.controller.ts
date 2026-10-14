import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarCorridaService } from '../services/buscar-corrida.service';
import { MotoristaCorridaDto } from './dtos/response/motorista-corrida.dto';

@ApiTags('Motorista')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.MOTORISTA)
export class BuscarCorridaController {
  constructor(private readonly buscarCorridaService: BuscarCorridaService) {}

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
}
