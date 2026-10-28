import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { SubstituirAdministradoresService } from '../services/substituir-administradores.service';
import { SubstituirAdministradoresRequestDto } from './dtos/request/substituir-administradores-request.dto';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

@ApiTags('Filial')
@Controller()
export class SubstituirAdministradoresController {
  constructor(
    private readonly substituirAdministradoresService: SubstituirAdministradoresService,
  ) {}

  @Put(':id/administradores')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Query(
      'empresaId',
      new ZodValidationPipe(z.coerce.number().int().positive()),
    )
    empresaId: number,
    @Body() body: SubstituirAdministradoresRequestDto,
  ): Promise<void> {
    await this.substituirAdministradoresService.execute(
      empresaId,
      id,
      body.administradorIds,
    );
  }
}
