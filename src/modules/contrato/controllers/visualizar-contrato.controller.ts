import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { VisualizarContratoService } from '../services/visualizar-contrato.service';

@ApiTags('Contrato')
@ApiBearerAuth()
@Controller()
export class VisualizarContratoController {
  constructor(
    private readonly visualizarContratoService: VisualizarContratoService,
  ) {}

  @Get(':id')
  @Perfis(TipoPerfil.ADMIN_FILIAL, TipoPerfil.ADMIN_FORNECEDOR)
  @ApiProduces(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  async handle(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<StreamableFile> {
    const documento = await this.visualizarContratoService.execute(id, usuario);

    return new StreamableFile(documento.stream, {
      type: documento.tipoMime,
      disposition: `inline; filename="${documento.nomeArquivo}"`,
    });
  }
}
