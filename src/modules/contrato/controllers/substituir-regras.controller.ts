import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { SubstituirRegrasService } from '../services/substituir-regras.service';
import { SubstituirRegrasRequestDto } from './dtos/request/substituir-regras-request.dto';

@ApiTags('Contrato')
@ApiBearerAuth()
@Controller()
export class SubstituirRegrasController {
  constructor(
    private readonly substituirRegrasService: SubstituirRegrasService,
  ) {}

  @Put(':id/regras')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: SubstituirRegrasRequestDto,
  ): Promise<void> {
    await this.substituirRegrasService.execute(id, body.regras, usuario);
  }
}
