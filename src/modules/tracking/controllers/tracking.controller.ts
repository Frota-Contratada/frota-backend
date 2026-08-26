import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TrackingService } from '../services/tracking.service';
import {
  PositionsBatchDto,
  RerouteDto,
  TrackingPositionDto,
} from './dtos/tracking-request.dto';
import {
  CanonicalRouteDto,
  TrackingSnapshotDto,
  WaitingDto,
} from './dtos/tracking-response.dto';

const tripIdPipe = new ZodValidationPipe(z.coerce.number().int().positive());

@ApiTags('Acompanhamento de corridas')
@ApiBearerAuth()
@Controller()
export class TrackingController {
  constructor(private readonly tracking: TrackingService) {}

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Obtém o snapshot autoritativo da corrida' })
  @ApiRespostaDe(TrackingSnapshotDto)
  async snapshot(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ResponseInterface<TrackingSnapshotDto>> {
    return { response: await this.tracking.snapshot(tripId, user) };
  }

  @Post(':id/tracking/positions/batch')
  @ApiOperation({ summary: 'Persiste um lote offline de posições do veículo' })
  async positions(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PositionsBatchDto,
  ): Promise<ResponseInterface<{ accepted: TrackingPositionDto | null }>> {
    const accepted = await this.tracking.saveVehiclePositions(
      tripId,
      user,
      body.positions,
    );
    return { response: { accepted } };
  }

  @Post(':id/tracking/passenger-position')
  @ApiOperation({ summary: 'Atualiza a posição auxiliar do passageiro' })
  async passengerPosition(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: TrackingPositionDto,
  ): Promise<ResponseInterface<{ accepted: TrackingPositionDto | null }>> {
    const accepted = await this.tracking.savePassengerPosition(
      tripId,
      user,
      body,
    );
    return { response: { accepted } };
  }

  @Post(':id/route/reroute')
  @ApiRespostaDe(CanonicalRouteDto)
  async reroute(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') key: string,
    @Body() body: RerouteDto,
  ): Promise<ResponseInterface<CanonicalRouteDto>> {
    return {
      response: await this.tracking.reroute(tripId, user, key, body.position),
    };
  }

  @Post(':id/waiting/start')
  @ApiRespostaDe(WaitingDto)
  async startWaiting(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') key: string,
  ): Promise<ResponseInterface<WaitingDto>> {
    return { response: await this.tracking.startWaiting(tripId, user, key) };
  }

  @Post(':id/waiting/resume')
  @ApiRespostaDe(WaitingDto)
  async resume(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') key: string,
  ): Promise<ResponseInterface<WaitingDto>> {
    return { response: await this.tracking.resume(tripId, user, key) };
  }

  @Post(':id/finish')
  async finish(
    @Param('id', tripIdPipe) tripId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') key: string,
  ): Promise<
    ResponseInterface<{ tripStatus: 'finished'; finishedAt: string }>
  > {
    return { response: await this.tracking.finish(tripId, user, key) };
  }

  @Post(':id/stops/:sequence/complete')
  @ApiOperation({ summary: 'Marca uma parada como concluída pelo motorista' })
  async completeStop(
    @Param('id', tripIdPipe) tripId: number,
    @Param('sequence', tripIdPipe) sequence: number,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') key: string,
  ): Promise<ResponseInterface<{ sequence: number; completedAt: string }>> {
    return {
      response: await this.tracking.completeStop(tripId, sequence, user, key),
    };
  }
}
