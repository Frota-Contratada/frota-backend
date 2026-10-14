import { Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { IniciarCorridaService } from '../services/iniciar-corrida.service';
import { MotoristaCorridaDto } from './dtos/response/motorista-corrida.dto';

@ApiTags('Motorista')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.MOTORISTA)
export class IniciarCorridaController {
  constructor(private readonly iniciarCorridaService: IniciarCorridaService) {}

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
}
