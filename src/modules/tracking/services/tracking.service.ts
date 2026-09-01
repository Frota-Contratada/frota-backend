import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import {
  CanonicalRoute,
  RouteWaypoint,
  TRACKING_MAX_FUTURE_SKEW_MS,
  TrackingPosition,
  TrackingSnapshot,
} from '../domain/tracking.types';
import {
  IdempotencyEmProcessamentoException,
  IdempotencyKeyInvalidaException,
  ParadaTrackingNaoEncontradaException,
  CorridaTrackingInativaException,
  TrackingAcessoNegadoException,
  TrackingCorridaNaoEncontradaException,
} from '../exceptions/tracking.exceptions';
import { TomTomRouteService } from './tomtom-route.service';
import { TrackingEventsService } from './tracking-events.service';

const ROUTE_INCLUDE = {
  Usuario: true,
  Veiculo: { include: { TipoVeiculo: true } },
  Solicitacao: {
    include: {
      Usuario: true,
      SolicitacaoPassageiro: true,
      Endereco_Solicitacao_nCdEnderecoOrigemToEndereco: true,
      Endereco_Solicitacao_nCdEnderecoDestinoToEndereco: true,
      Parada: {
        include: { Endereco: true },
        orderBy: { iOrdem: 'asc' as const },
      },
    },
  },
} satisfies Prisma.CorridaInclude;

type TrackingTrip = Prisma.CorridaGetPayload<{ include: typeof ROUTE_INCLUDE }>;
type PositionOrigin = 'V' | 'P';
const IDEMPOTENCY_WAIT_MS = 12_000;
const IDEMPOTENCY_LEASE_MS = 30_000;

const WaypointFields = {
  id: z.string(),
  sequence: z.number().int().nonnegative(),
  label: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
};
const CanonicalRouteSchema: z.ZodType<CanonicalRoute> = z.object({
  routeId: z.string().uuid(),
  version: z.number().int().positive(),
  calculatedAt: z.iso.datetime({ offset: true }),
  origin: z.object({ ...WaypointFields, kind: z.literal('origin') }),
  stops: z.array(z.object({ ...WaypointFields, kind: z.literal('stop') })),
  destination: z.object({
    ...WaypointFields,
    kind: z.literal('destination'),
  }),
  coordinates: z.array(z.object({ lat: z.number(), lng: z.number() })).min(2),
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  trafficDelaySeconds: z.number().nonnegative(),
  trafficSections: z.array(
    z.object({
      startIndex: z.number().int().nonnegative(),
      endIndex: z.number().int().nonnegative(),
      delaySeconds: z.number().nonnegative(),
      category: z.string(),
    }),
  ),
  instructions: z.array(
    z.object({
      id: z.string(),
      instruction: z.string(),
      streetName: z.string(),
      distanceMeters: z.number().nonnegative(),
      durationSeconds: z.number().nonnegative(),
      type: z.string(),
      modifier: z.string().nullable(),
      icon: z.string().nullable(),
      location: z.object({ lat: z.number(), lng: z.number() }),
      coordinateIndex: z.number().int().nonnegative(),
    }),
  ),
});

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tomTom: TomTomRouteService,
    private readonly events: TrackingEventsService,
  ) {}

  async assegurarRotaInicial(
    tripId: number,
    motoristaId?: number,
  ): Promise<CanonicalRoute> {
    const trip = await this.loadTrip(tripId);
    if (motoristaId != null && trip.nCdMotorista.toNumber() !== motoristaId) {
      throw new TrackingAcessoNegadoException();
    }
    const status = trip.cStatus.trim();
    if (status !== 'A' && status !== 'I') {
      throw new CorridaTrackingInativaException();
    }
    const existing = await this.latestRoute(tripId);
    if (existing) return existing;

    const { origin, stops, destination } = this.waypointsFromTrip(trip);
    const calculated = await this.tomTom.calculate(
      origin,
      stops,
      destination,
      1,
    );
    return this.persistRoute(tripId, calculated, true);
  }

  publishStarted(tripId: number): void {
    this.events.publish(tripId, 'trip.statusChanged', {
      tripStatus: 'in_progress',
    });
  }

  async snapshot(
    tripId: number,
    user: AuthenticatedUser,
  ): Promise<TrackingSnapshot> {
    const trip = await this.loadTrip(tripId);
    await this.assertCanAccess(trip, user);
    const route =
      (await this.latestRoute(tripId)) ??
      (await this.assegurarRotaInicial(tripId));
    const driverAccess = trip.nCdMotorista.toNumber() === user.id;
    const [vehiclePosition, passengerPosition, activeWaiting] =
      await Promise.all([
        this.latestPosition(tripId, 'V', null),
        driverAccess
          ? Promise.resolve(null)
          : this.latestPosition(tripId, 'P', user.id),
        this.prisma.corridaEspera.findFirst({
          where: { nCdCorrida: tripId, dFim: null },
          orderBy: { dInicio: 'desc' },
        }),
      ]);
    const updatedDates = [
      trip.dInicioCorrida,
      trip.dFimCorrida,
      new Date(route.calculatedAt),
      vehiclePosition ? new Date(vehiclePosition.timestamp) : null,
      passengerPosition ? new Date(passengerPosition.timestamp) : null,
      activeWaiting?.dInicio,
    ].filter((value): value is Date => value instanceof Date);

    return {
      tripStatus: this.mapStatus(trip.cStatus),
      waiting: {
        active: activeWaiting != null,
        startedAt: activeWaiting?.dInicio.toISOString() ?? null,
      },
      route,
      vehiclePosition,
      passengerPosition,
      driver: {
        id: trip.nCdMotorista.toFixed(0),
        displayName: trip.Usuario.cNmUsuario,
      },
      vehicle: {
        id: trip.nCdVeiculo.toFixed(0),
        plate: trip.Veiculo.cPlaca,
        description: trip.Veiculo.TipoVeiculo?.cNmTpVeiculo,
      },
      startedAt: trip.dInicioCorrida.toISOString(),
      updatedAt: new Date(
        Math.max(...updatedDates.map((date) => date.getTime())),
      ).toISOString(),
    };
  }

  async saveVehiclePositions(
    tripId: number,
    user: AuthenticatedUser,
    positions: TrackingPosition[],
  ): Promise<TrackingPosition | null> {
    const trip = await this.loadTrip(tripId);
    this.assertDriver(trip, user.id);
    this.assertInProgress(trip);
    const accepted = await this.persistOrderedPositions(
      tripId,
      'V',
      null,
      positions,
    );
    if (accepted) this.events.publish(tripId, 'vehicle.location', accepted);
    return accepted;
  }

  async savePassengerPosition(
    tripId: number,
    user: AuthenticatedUser,
    position: TrackingPosition,
  ): Promise<TrackingPosition | null> {
    const trip = await this.loadTrip(tripId);
    await this.assertPassenger(trip, user.id);
    this.assertInProgress(trip);
    const accepted = await this.persistOrderedPositions(tripId, 'P', user.id, [
      position,
    ]);
    return accepted;
  }

  async reroute(
    tripId: number,
    user: AuthenticatedUser,
    key: string,
    position: TrackingPosition,
  ): Promise<CanonicalRoute> {
    const trip = await this.loadTrip(tripId);
    this.assertDriver(trip, user.id);
    return this.idempotent(
      tripId,
      key,
      'route.reroute',
      async () => {
        this.assertInProgress(trip);
        const completedStops =
          await this.prisma.corridaParadaProgresso.findMany({
            where: { nCdCorrida: tripId },
            select: { iOrdem: true },
          });
        const { stops, destination } = this.waypointsFromTrip(
          trip,
          new Set(completedStops.map((stop) => stop.iOrdem)),
        );
        const origin: RouteWaypoint = {
          id: `position:${position.timestamp}`,
          sequence: 0,
          kind: 'origin',
          label: 'Posição atual do veículo',
          lat: position.lat,
          lng: position.lng,
        };
        const latest = await this.latestRoute(tripId);
        const calculated = await this.tomTom.calculate(
          origin,
          stops,
          destination,
          (latest?.version ?? 0) + 1,
        );
        return calculated;
      },
      async (tx, calculated) => {
        await this.assertInProgressTx(tx, tripId);
        return this.persistRouteInTransaction(tx, tripId, calculated, false);
      },
      (persisted) => this.events.publish(tripId, 'route.replaced', persisted),
    );
  }

  async startWaiting(
    tripId: number,
    user: AuthenticatedUser,
    key: string,
  ): Promise<{ active: boolean; startedAt: string | null }> {
    const trip = await this.loadTrip(tripId);
    this.assertDriver(trip, user.id);
    let changed = false;
    return this.idempotent(
      tripId,
      key,
      'waiting.start',
      () => Promise.resolve(undefined),
      async (tx) => {
        await this.assertInProgressTx(tx, tripId);
        const active = await tx.corridaEspera.findFirst({
          where: { nCdCorrida: tripId, dFim: null },
          orderBy: { dInicio: 'desc' },
        });
        const waiting = active
          ? active
          : await tx.corridaEspera.create({
              data: { nCdCorrida: tripId, dInicio: new Date() },
            });
        changed = active == null;
        return {
          active: true,
          startedAt: waiting.dInicio.toISOString(),
        };
      },
      (result) => {
        if (changed) this.events.publish(tripId, 'waiting.changed', result);
      },
    );
  }

  async resume(
    tripId: number,
    user: AuthenticatedUser,
    key: string,
  ): Promise<{ active: boolean; startedAt: string | null }> {
    const trip = await this.loadTrip(tripId);
    this.assertDriver(trip, user.id);
    let changed = false;
    return this.idempotent(
      tripId,
      key,
      'waiting.resume',
      () => Promise.resolve(undefined),
      async (tx) => {
        await this.assertInProgressTx(tx, tripId);
        const updated = await tx.corridaEspera.updateMany({
          where: { nCdCorrida: tripId, dFim: null },
          data: { dFim: new Date() },
        });
        changed = updated.count > 0;
        return { active: false, startedAt: null };
      },
      (result) => {
        if (changed) this.events.publish(tripId, 'waiting.changed', result);
      },
    );
  }

  async finish(
    tripId: number,
    user: AuthenticatedUser,
    key: string,
  ): Promise<{ tripStatus: 'finished'; finishedAt: string }> {
    const trip = await this.loadTrip(tripId);
    this.assertDriver(trip, user.id);
    let changed = false;
    return this.idempotent(
      tripId,
      key,
      'trip.finish',
      () => Promise.resolve(undefined),
      async (tx) => {
        const current = await tx.corrida.findUnique({
          where: { nCdCorrida: tripId },
          select: { cStatus: true, dFimCorrida: true },
        });
        if (!current) throw new TrackingCorridaNaoEncontradaException(tripId);
        const status = current.cStatus.trim();
        if (status !== 'I' && status !== 'F') {
          throw new CorridaTrackingInativaException();
        }
        if (status === 'F' && current.dFimCorrida) {
          return {
            tripStatus: 'finished' as const,
            finishedAt: current.dFimCorrida.toISOString(),
          };
        }
        const finishedAt = current.dFimCorrida ?? new Date();
        await tx.corridaEspera.updateMany({
          where: { nCdCorrida: tripId, dFim: null },
          data: { dFim: finishedAt },
        });
        await tx.corrida.update({
          where: { nCdCorrida: tripId },
          data: {
            cStatus: StatusCorrida.FINALIZADA,
            dFimCorrida: finishedAt,
          },
        });
        changed = true;
        return {
          tripStatus: 'finished' as const,
          finishedAt: finishedAt.toISOString(),
        };
      },
      (result) => {
        if (changed) this.events.publish(tripId, 'trip.statusChanged', result);
      },
    );
  }

  async completeStop(
    tripId: number,
    sequence: number,
    user: AuthenticatedUser,
    key: string,
  ): Promise<{ sequence: number; completedAt: string }> {
    const trip = await this.loadTrip(tripId);
    this.assertDriver(trip, user.id);
    if (!trip.Solicitacao.Parada.some((stop) => stop.iOrdem === sequence)) {
      throw new ParadaTrackingNaoEncontradaException(sequence);
    }
    return this.idempotent(
      tripId,
      key,
      'stop.complete',
      () => Promise.resolve(undefined),
      async (tx) => {
        await this.assertInProgressTx(tx, tripId);
        const existing = await tx.corridaParadaProgresso.findUnique({
          where: {
            nCdCorrida_iOrdem: { nCdCorrida: tripId, iOrdem: sequence },
          },
        });
        const completed =
          existing ??
          (await tx.corridaParadaProgresso.create({
            data: {
              nCdCorrida: tripId,
              iOrdem: sequence,
              nCdUsuario: user.id,
              dConcluida: new Date(),
            },
          }));
        return {
          sequence,
          completedAt: completed.dConcluida.toISOString(),
        };
      },
    );
  }

  async canAccess(tripId: number, user: AuthenticatedUser): Promise<void> {
    await this.assertCanAccess(await this.loadTrip(tripId), user);
  }

  async isDriver(tripId: number, userId: number): Promise<boolean> {
    const trip = await this.loadTrip(tripId);
    return trip.nCdMotorista.toNumber() === userId;
  }

  private async persistOrderedPositions(
    tripId: number,
    origin: PositionOrigin,
    userId: number | null,
    positions: TrackingPosition[],
    attempt = 0,
  ): Promise<TrackingPosition | null> {
    const ordered = [...positions].sort(
      (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
    );
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const latest = await tx.corridaPosicao.findFirst({
            where: {
              nCdCorrida: tripId,
              cOrigem: origin,
              nCdUsuario: userId,
              dPosicao: {
                lte: new Date(Date.now() + TRACKING_MAX_FUTURE_SKEW_MS),
              },
            },
            orderBy: { dPosicao: 'desc' },
          });
          let lastTimestamp = latest?.dPosicao.getTime() ?? -Infinity;
          let accepted: TrackingPosition | null = null;
          for (const position of ordered) {
            const timestamp = new Date(position.timestamp);
            if (timestamp.getTime() <= lastTimestamp) continue;
            await tx.corridaPosicao.create({
              data: {
                nCdCorrida: tripId,
                cOrigem: origin,
                nCdUsuario: userId,
                nLatitude: position.lat,
                nLongitude: position.lng,
                nAccuracy: position.accuracy,
                nSpeed: position.speed,
                nHeading: position.heading,
                dPosicao: timestamp,
              },
            });
            lastTimestamp = timestamp.getTime();
            accepted = { ...position, timestamp: timestamp.toISOString() };
          }
          return accepted;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        attempt < 2 &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2034'].includes(error.code)
      ) {
        return this.persistOrderedPositions(
          tripId,
          origin,
          userId,
          ordered,
          attempt + 1,
        );
      }
      throw error;
    }
  }

  private async latestPosition(
    tripId: number,
    origin: PositionOrigin,
    userId: number | null,
  ): Promise<TrackingPosition | null> {
    const position = await this.prisma.corridaPosicao.findFirst({
      where: {
        nCdCorrida: tripId,
        cOrigem: origin,
        nCdUsuario: userId,
        dPosicao: {
          lte: new Date(Date.now() + TRACKING_MAX_FUTURE_SKEW_MS),
        },
      },
      orderBy: { dPosicao: 'desc' },
    });
    return position
      ? {
          lat: position.nLatitude.toNumber(),
          lng: position.nLongitude.toNumber(),
          accuracy: position.nAccuracy.toNumber(),
          speed: position.nSpeed.toNumber(),
          heading: position.nHeading.toNumber(),
          timestamp: position.dPosicao.toISOString(),
        }
      : null;
  }

  private async persistRoute(
    tripId: number,
    calculated: CanonicalRoute,
    onlyIfMissing: boolean,
    attempt = 0,
  ): Promise<CanonicalRoute> {
    try {
      return await this.prisma.$transaction(
        (tx) =>
          this.persistRouteInTransaction(tx, tripId, calculated, onlyIfMissing),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        attempt < 2 &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2034'].includes(error.code)
      ) {
        return this.persistRoute(
          tripId,
          calculated,
          onlyIfMissing,
          attempt + 1,
        );
      }
      throw error;
    }
  }

  private async persistRouteInTransaction(
    tx: Prisma.TransactionClient,
    tripId: number,
    calculated: CanonicalRoute,
    onlyIfMissing: boolean,
  ): Promise<CanonicalRoute> {
    const latest = await tx.corridaRota.findFirst({
      where: { nCdCorrida: tripId },
      orderBy: { iVersao: 'desc' },
    });
    if (onlyIfMissing && latest) return this.parseRoute(latest.cPayload);
    const route = {
      ...calculated,
      routeId: randomUUID(),
      version: (latest?.iVersao ?? 0) + 1,
      calculatedAt: new Date().toISOString(),
    };
    await tx.corridaRota.create({
      data: {
        nCdCorrida: tripId,
        iVersao: route.version,
        cRouteId: route.routeId,
        cPayload: JSON.stringify(route),
        dCalculada: new Date(route.calculatedAt),
      },
    });
    return route;
  }

  private async latestRoute(tripId: number): Promise<CanonicalRoute | null> {
    const route = await this.prisma.corridaRota.findFirst({
      where: { nCdCorrida: tripId },
      orderBy: { iVersao: 'desc' },
    });
    return route ? this.parseRoute(route.cPayload) : null;
  }

  private parseRoute(payload: string): CanonicalRoute {
    return CanonicalRouteSchema.parse(JSON.parse(payload));
  }

  private async loadTrip(tripId: number): Promise<TrackingTrip> {
    const trip = await this.prisma.corrida.findUnique({
      where: { nCdCorrida: tripId },
      include: ROUTE_INCLUDE,
    });
    if (!trip) throw new TrackingCorridaNaoEncontradaException(tripId);
    return trip;
  }

  private assertDriver(trip: TrackingTrip, userId: number): void {
    if (trip.nCdMotorista.toNumber() !== userId) {
      throw new TrackingAcessoNegadoException();
    }
  }

  private assertInProgress(trip: TrackingTrip): void {
    if (trip.cStatus.trim() !== 'I') {
      throw new CorridaTrackingInativaException();
    }
  }

  private async assertInProgressTx(
    tx: Prisma.TransactionClient,
    tripId: number,
  ): Promise<void> {
    const trip = await tx.corrida.findUnique({
      where: { nCdCorrida: tripId },
      select: { cStatus: true },
    });
    if (!trip) throw new TrackingCorridaNaoEncontradaException(tripId);
    if (trip.cStatus.trim() !== 'I') {
      throw new CorridaTrackingInativaException();
    }
  }

  private async assertCanAccess(
    trip: TrackingTrip,
    user: AuthenticatedUser,
  ): Promise<void> {
    if (trip.nCdMotorista.toNumber() === user.id) return;
    await this.assertPassenger(trip, user.id);
  }

  private async assertPassenger(
    trip: TrackingTrip,
    userId: number,
  ): Promise<void> {
    if (trip.Solicitacao.nCdSolicitante.toNumber() === userId) return;
    const user = await this.prisma.usuario.findUnique({
      where: { nCdUsuario: userId },
      select: { cCPF: true },
    });
    if (
      user?.cCPF &&
      trip.Solicitacao.SolicitacaoPassageiro.some(
        (passenger) => passenger.cCPF === user.cCPF,
      )
    ) {
      return;
    }
    throw new TrackingAcessoNegadoException();
  }

  private waypointsFromTrip(
    trip: TrackingTrip,
    completedStops = new Set<number>(),
  ): {
    origin: RouteWaypoint;
    stops: RouteWaypoint[];
    destination: RouteWaypoint;
  } {
    const origin = this.toWaypoint(
      trip.Solicitacao.Endereco_Solicitacao_nCdEnderecoOrigemToEndereco,
      0,
      'origin',
    );
    const stops = trip.Solicitacao.Parada.filter(
      (stop) => !completedStops.has(stop.iOrdem),
    ).map((stop) => this.toWaypoint(stop.Endereco, stop.iOrdem, 'stop'));
    const destinationSequence =
      Math.max(0, ...trip.Solicitacao.Parada.map((stop) => stop.iOrdem)) + 1;
    const destination = this.toWaypoint(
      trip.Solicitacao.Endereco_Solicitacao_nCdEnderecoDestinoToEndereco,
      destinationSequence,
      'destination',
    );
    return { origin, stops, destination };
  }

  private toWaypoint(
    address: TrackingTrip['Solicitacao']['Endereco_Solicitacao_nCdEnderecoOrigemToEndereco'],
    sequence: number,
    kind: RouteWaypoint['kind'],
  ): RouteWaypoint {
    return {
      id: address.nCdEndereco.toFixed(0),
      sequence,
      kind,
      label: [
        address.cEndereco,
        address.cNumero,
        address.cBairro,
        `${address.cCidade}/${address.cUf}`,
      ]
        .filter(Boolean)
        .join(', '),
      lat: address.nLatitude.toNumber(),
      lng: address.nLongitude.toNumber(),
    };
  }

  private mapStatus(status: string): TrackingSnapshot['tripStatus'] {
    const value = status.trim();
    if (value === 'A') return 'scheduled';
    if (value === 'F') return 'finished';
    if (value === 'C') return 'canceled';
    return 'in_progress';
  }

  private async idempotent<T, TPrepared>(
    tripId: number,
    key: string,
    type: string,
    prepare: () => Promise<TPrepared>,
    commit: (tx: Prisma.TransactionClient, prepared: TPrepared) => Promise<T>,
    afterPersist?: (result: T) => void,
  ): Promise<T> {
    if (!z.string().uuid().safeParse(key).success) {
      throw new IdempotencyKeyInvalidaException();
    }
    let owner = false;
    let leaseAt: Date | null = null;
    try {
      leaseAt = new Date();
      await this.prisma.comandoIdempotente.create({
        data: {
          nCdCorrida: tripId,
          cChave: key,
          cTipo: type,
          cEstado: 'PROCESSING',
          dAtualizacao: leaseAt,
        },
      });
      owner = true;
    } catch (error) {
      leaseAt = null;
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      ) {
        throw error;
      }
    }

    if (!owner) {
      const waitUntil = Date.now() + IDEMPOTENCY_WAIT_MS;
      while (Date.now() < waitUntil) {
        const existing = await this.prisma.comandoIdempotente.findUnique({
          where: { nCdCorrida_cChave: { nCdCorrida: tripId, cChave: key } },
        });
        if (!existing) break;
        if (existing.cTipo !== type) {
          throw new IdempotencyKeyInvalidaException(
            'Esta Idempotency-Key já foi usada em outro tipo de comando.',
          );
        }
        if (existing.cEstado === 'COMPLETED' && existing.cResultado) {
          return JSON.parse(existing.cResultado) as T;
        }
        if (existing.cEstado === 'FAILED' && existing.cResultado) {
          const failure = z
            .object({
              status: z.number().int(),
              body: z.union([z.string(), z.record(z.string(), z.unknown())]),
            })
            .parse(JSON.parse(existing.cResultado));
          throw new HttpException(failure.body, failure.status);
        }
        if (
          existing.cEstado === 'PROCESSING' &&
          Date.now() - existing.dAtualizacao.getTime() > IDEMPOTENCY_LEASE_MS
        ) {
          const reclaimedAt = new Date();
          const reclaimed = await this.prisma.comandoIdempotente.updateMany({
            where: {
              nCdCorrida: tripId,
              cChave: key,
              cTipo: type,
              cEstado: 'PROCESSING',
              dAtualizacao: existing.dAtualizacao,
            },
            data: { dAtualizacao: reclaimedAt },
          });
          if (reclaimed.count === 1) {
            owner = true;
            leaseAt = reclaimedAt;
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      if (!owner) throw new IdempotencyEmProcessamentoException();
    }
    if (!leaseAt) throw new IdempotencyEmProcessamentoException();

    let prepared: TPrepared;
    try {
      prepared = await prepare();
    } catch (error) {
      await this.persistIdempotencyFailure(tripId, key, leaseAt, error);
      throw error;
    }

    let result: T;
    try {
      result = await this.commitIdempotent(
        tripId,
        key,
        leaseAt,
        prepared,
        commit,
      );
    } catch (error) {
      await this.persistIdempotencyFailure(tripId, key, leaseAt, error);
      throw error;
    }

    afterPersist?.(result);
    return result;
  }

  private async commitIdempotent<T, TPrepared>(
    tripId: number,
    key: string,
    leaseAt: Date,
    prepared: TPrepared,
    commit: (tx: Prisma.TransactionClient, prepared: TPrepared) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const result = await commit(tx, prepared);
            const completed = await tx.comandoIdempotente.updateMany({
              where: {
                nCdCorrida: tripId,
                cChave: key,
                cEstado: 'PROCESSING',
                dAtualizacao: leaseAt,
              },
              data: {
                cEstado: 'COMPLETED',
                cResultado: JSON.stringify(result),
              },
            });
            if (completed.count !== 1) {
              throw new IdempotencyEmProcessamentoException();
            }
            return result;
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 15_000,
          },
        );
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          ['P2002', 'P2034'].includes(error.code);
        if (!retryable || attempt === 2) throw error;
      }
    }
    throw new IdempotencyEmProcessamentoException();
  }

  private async persistIdempotencyFailure(
    tripId: number,
    key: string,
    leaseAt: Date,
    error: unknown,
  ): Promise<void> {
    const failure =
      error instanceof HttpException
        ? { status: error.getStatus(), body: error.getResponse() }
        : {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Internal server error',
            },
          };
    await this.prisma.comandoIdempotente.updateMany({
      where: {
        nCdCorrida: tripId,
        cChave: key,
        cEstado: 'PROCESSING',
        dAtualizacao: leaseAt,
      },
      data: { cEstado: 'FAILED', cResultado: JSON.stringify(failure) },
    });
  }
}
