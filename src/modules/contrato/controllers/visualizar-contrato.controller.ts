import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { VisualizarContratoService } from '../services/visualizar-contrato.service';

@ApiTags('Contrato')
@ApiBearerAuth()
@Controller()
export class VisualizarContratoController {
  constructor(
    private readonly visualizarContratoService: VisualizarContratoService,
  ) {}

  @Get(':id')
  @ApiProduces(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<StreamableFile> {
    const documento = await this.visualizarContratoService.execute(id);

    return new StreamableFile(documento.stream, {
      type: documento.tipoMime,
      disposition: `inline; filename="${documento.nomeArquivo}"`,
    });
  }
}
