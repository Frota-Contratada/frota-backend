import { ConfigService } from '@nestjs/config';
import { TomTomRouteService } from './tomtom-route.service';
import {
  TomTomFalhaException,
  TomTomTimeoutException,
} from '../exceptions/tracking.exceptions';

describe('TomTomRouteService', () => {
  const origin = {
    id: '1',
    sequence: 0,
    kind: 'origin' as const,
    label: 'Origem',
    lat: -23.55,
    lng: -46.63,
  };
  const destination = {
    id: '2',
    sequence: 1,
    kind: 'destination' as const,
    label: 'Destino',
    lat: -23.56,
    lng: -46.64,
  };

  afterEach(() => jest.restoreAllMocks());

  it('converte coordenadas, trânsito e instruções para a rota canônica', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          routes: [
            {
              summary: {
                lengthInMeters: 1500,
                travelTimeInSeconds: 300,
                trafficDelayInSeconds: 45,
              },
              legs: [
                {
                  points: [
                    { latitude: -23.55, longitude: -46.63 },
                    { latitude: -23.555, longitude: -46.635 },
                    { latitude: -23.56, longitude: -46.64 },
                  ],
                },
              ],
              sections: [
                {
                  startPointIndex: 1,
                  endPointIndex: 2,
                  delayInSeconds: 45,
                  simpleCategory: 'JAM',
                },
              ],
              guidance: {
                instructions: [
                  {
                    id: 7,
                    message: 'Vire à direita',
                    street: 'Rua A',
                    routeOffsetInMeters: 500,
                    travelTimeInSeconds: 60,
                    instructionType: 'TURN',
                    maneuver: 'RIGHT',
                    point: { latitude: -23.555, longitude: -46.635 },
                  },
                  {
                    id: 8,
                    message: 'Chegue ao destino',
                    street: 'Rua B',
                    routeOffsetInMeters: 900,
                    travelTimeInSeconds: 90,
                    instructionType: 'LOCATION_ARRIVAL',
                    maneuver: null,
                    point: { latitude: -23.56, longitude: -46.64 },
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const service = new TomTomRouteService(
      new ConfigService({ TOMTOM_API_KEY: 'secret-test-key' }),
    );

    const route = await service.calculate(origin, [], destination, 1);

    expect(route).toMatchObject({
      version: 1,
      distanceMeters: 1500,
      durationSeconds: 300,
      trafficDelaySeconds: 45,
      trafficSections: [
        { startIndex: 1, endIndex: 2, delaySeconds: 45, category: 'JAM' },
      ],
    });
    expect(route.instructions[0]).toMatchObject({
      id: '7',
      instruction: 'Vire à direita',
      streetName: 'Rua A',
      coordinateIndex: 1,
      distanceMeters: 500,
      durationSeconds: 60,
    });
    expect(route.instructions[1]).toMatchObject({
      id: '8',
      coordinateIndex: 2,
      distanceMeters: 400,
      durationSeconds: 30,
    });
    const requested = new URL(fetchMock.mock.calls[0][0] as URL);
    expect(requested.searchParams.get('key')).toBe('secret-test-key');
    expect(requested.searchParams.get('traffic')).toBe('true');
    expect(requested.searchParams.get('language')).toBe('pt-BR');
    expect(requested.searchParams.get('instructionsType')).toBe('text');
  });

  it('normaliza falhas HTTP sem expor o corpo do provedor', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('secret', { status: 500 }));
    const service = new TomTomRouteService(
      new ConfigService({ TOMTOM_API_KEY: 'secret-test-key' }),
    );
    await expect(
      service.calculate(origin, [], destination, 1),
    ).rejects.toBeInstanceOf(TomTomFalhaException);
  });

  it('distingue timeout do TomTom', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new DOMException('timeout', 'TimeoutError'));
    const service = new TomTomRouteService(
      new ConfigService({ TOMTOM_API_KEY: 'secret-test-key' }),
    );
    await expect(
      service.calculate(origin, [], destination, 1),
    ).rejects.toBeInstanceOf(TomTomTimeoutException);
  });
});
