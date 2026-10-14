import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { RecusarCorridaService } from '../services/recusar-corrida.service';
import { RecusarCorridaRequestDto } from './dtos/request/recusar-corrida-request.dto';
import { MotoristaCorridaDto } from './dtos/response/motorista-corrida.dto';

@ApiTags('Motorista')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.MOTORISTA)
export class RecusarCorridaController {
  constructor(private readonly recusarCorridaService: RecusarCorridaService) {}

  @Post('corridas/:id/recusar')
  async recusarCorrida(
    @CurrentUser('id') motoristaId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @Body() body: RecusarCorridaRequestDto,
  ): Promise<ResponseInterface<MotoristaCorridaDto>> {
    const corrida = await this.recusarCorridaService.execute(
      corridaId,
      motoristaId,
      body.motivo,
    );

    return { response: new MotoristaCorridaDto(corrida) };
  }
}
