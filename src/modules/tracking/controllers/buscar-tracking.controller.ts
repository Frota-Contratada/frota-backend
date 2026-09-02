import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { BuscarTrackingService } from '../services/buscar-tracking.service';
import { SnapshotTrackingDto } from './dtos/response/snapshot-tracking.dto';

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class BuscarTrackingController {
  constructor(private readonly buscarTrackingService: BuscarTrackingService) {}

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Obtém o snapshot autoritativo da corrida' })
  @ApiRespostaDe(SnapshotTrackingDto)
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    corridaId: number,
    @CurrentUser() usuario: AuthenticatedUser,
  ): Promise<ResponseInterface<SnapshotTrackingDto>> {
    return {
      response: await this.buscarTrackingService.execute(corridaId, usuario),
    };
  }
}
