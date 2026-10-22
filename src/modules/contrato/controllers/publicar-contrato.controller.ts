import { Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { PublicarContratoService } from '../services/publicar-contrato.service';
import { ContratoDto } from './dtos/response/contrato.dto';

@ApiTags('Contrato')
@ApiBearerAuth()
@Controller()
export class PublicarContratoController {
  constructor(
    private readonly publicarContratoService: PublicarContratoService,
  ) {}

  @Patch(':id/publicacao')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  async handle(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<ContratoDto>> {
    const contrato = await this.publicarContratoService.execute(id, usuario);

    return { response: new ContratoDto(contrato) };
  }
}
