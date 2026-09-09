import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { CanonicalRoute, RouteWaypoint } from '../domain/tracking.types';
import { TomTomFalhaException } from '../exceptions/tomtom-falha.exception';
import { TomTomTimeoutException } from '../exceptions/tomtom-timeout.exception';

const TomTomResponseSchema = z.object({
  routes: z
    .array(
      z.object({
        summary: z.object({
          lengthInMeters: z.number(),
          travelTimeInSeconds: z.number(),
          trafficDelayInSeconds: z.number().optional().default(0),
        }),
        legs: z.array(
          z.object({
            points: z.array(
              z.object({ latitude: z.number(), longitude: z.number() }),
            ),
          }),
        ),
        sections: z
          .array(
            z.object({
              startPointIndex: z.number().int(),
              endPointIndex: z.number().int(),
              delayInSeconds: z.number().optional().default(0),
              simpleCategory: z.string().optional().default('unknown'),
            }),
          )
          .optional()
          .default([]),
        guidance: z
          .object({
            instructions: z.array(
              z.object({
                id: z.union([z.string(), z.number()]).optional(),
                message: z.string().optional().default(''),
                street: z.string().optional().default(''),
                routeOffsetInMeters: z.number().optional().default(0),
                travelTimeInSeconds: z.number().optional().default(0),
                instructionType: z.string().optional().default('unknown'),
                maneuver: z.string().nullable().optional(),
                point: z.object({
                  latitude: z.number(),
                  longitude: z.number(),
                }),
              }),
            ),
          })
          .optional(),
      }),
    )
    .min(1),
});

@Injectable()
export class TomTomRouteService {
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('TOMTOM_API_KEY');
    const configuredTimeout = Number(
      config.get<string>('TOMTOM_TIMEOUT_MS') ?? 8_000,
    );
    this.timeoutMs = Number.isFinite(configuredTimeout)
      ? Math.max(100, configuredTimeout)
      : 8_000;
  }

  async calculate(
    origin: RouteWaypoint,
    stops: RouteWaypoint[],
    destination: RouteWaypoint,
    version: number,
  ): Promise<CanonicalRoute> {
    const waypoints = [origin, ...stops, destination];
    const locations = waypoints.map((p) => `${p.lat},${p.lng}`).join(':');
    const url = new URL(
      `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`,
    );
    const params = {
      key: this.apiKey,
      travelMode: 'car',
      routeType: 'fastest',
      traffic: 'true',
      departAt: 'now',
      routeRepresentation: 'polyline',
      instructionsType: 'text',
      language: 'pt-BR',
      sectionType: 'traffic',
    };
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );

    let response: Response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      const errorName = z.object({ name: z.string() }).safeParse(error)
        .data?.name;
      if (errorName === 'TimeoutError') {
        throw new TomTomTimeoutException();
      }
      throw new TomTomFalhaException();
    }
    if (!response.ok) throw new TomTomFalhaException();

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new TomTomFalhaException();
    }
    const parsed = TomTomResponseSchema.safeParse(body);
    if (!parsed.success) throw new TomTomFalhaException();
    const route = parsed.data.routes[0];
    const coordinates = route.legs.flatMap((leg, legIndex) =>
      leg.points
        .filter((_, pointIndex) => legIndex === 0 || pointIndex > 0)
        .map((point) => ({ lat: point.latitude, lng: point.longitude })),
    );
    if (coordinates.length < 2) throw new TomTomFalhaException();

    return {
      routeId: randomUUID(),
      version,
      calculatedAt: new Date().toISOString(),
      origin,
      stops,
      destination,
      coordinates,
      distanceMeters: route.summary.lengthInMeters,
      durationSeconds: route.summary.travelTimeInSeconds,
      trafficDelaySeconds: route.summary.trafficDelayInSeconds,
      trafficSections: route.sections.map((section) => ({
        startIndex: this.clampIndex(
          section.startPointIndex,
          coordinates.length,
        ),
        endIndex: this.clampIndex(section.endPointIndex, coordinates.length),
        delaySeconds: section.delayInSeconds,
        category: section.simpleCategory,
      })),
      instructions: (route.guidance?.instructions ?? []).map(
        (instruction, index, instructions) => {
          const location = {
            lat: instruction.point.latitude,
            lng: instruction.point.longitude,
          };
          const previous = instructions[index - 1];
          return {
            id: instruction.id?.toString() ?? `${version}-${index}`,
            instruction: instruction.message,
            streetName: instruction.street,
            distanceMeters: Math.max(
              0,
              instruction.routeOffsetInMeters -
                (previous?.routeOffsetInMeters ?? 0),
            ),
            durationSeconds: Math.max(
              0,
              instruction.travelTimeInSeconds -
                (previous?.travelTimeInSeconds ?? 0),
            ),
            type: instruction.instructionType,
            modifier: instruction.maneuver ?? null,
            icon: null,
            location,
            coordinateIndex: this.nearestIndex(location, coordinates),
          };
        },
      ),
    };
  }

  private clampIndex(index: number, length: number): number {
    return Math.max(0, Math.min(index, length - 1));
  }

  private nearestIndex(
    location: { lat: number; lng: number },
    coordinates: Array<{ lat: number; lng: number }>,
  ): number {
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    coordinates.forEach((coordinate, index) => {
      const distance =
        (coordinate.lat - location.lat) ** 2 +
        (coordinate.lng - location.lng) ** 2;
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    return nearest;
  }
}
