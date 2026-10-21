import { TomTomRotaService } from './tomtom-rota.service';
import { HaversineRotaService } from './haversine-rota.service';

describe('TomTomRotaService', () => {
  const pontos = [
    { latitude: -23.3103, longitude: -51.1628 },
    { latitude: -23.3335, longitude: -51.1301 },
  ];
  const fetchOriginal = global.fetch;

  const criarService = (apiKey?: string, emCache: string | null = null) => {
    const redis = {
      get: jest.fn().mockResolvedValue(emCache),
      set: jest.fn().mockResolvedValue('OK'),
    };
    const config = {
      get: jest.fn((chave: string) =>
        chave === 'TOMTOM_API_KEY' ? apiKey : undefined,
      ),
    };
    const haversine = new HaversineRotaService();
    const service = new TomTomRotaService(
      config as never,
      redis as never,
      haversine,
    );

    return { service, redis, haversine };
  };

  const respostaTomTom = (corpo: unknown, ok = true) =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(corpo),
    } as Response);

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('usa a distância por ruas da TomTom e guarda no cache', async () => {
    global.fetch = jest.fn().mockReturnValue(
      respostaTomTom({
        routes: [
          { summary: { lengthInMeters: 5432, travelTimeInSeconds: 601 } },
        ],
      }),
    );
    const { service, redis } = criarService('chave');

    await expect(service.calcular(pontos)).resolves.toEqual({
      distanciaKm: 5.432,
      duracaoMinutos: 11,
    });
    expect(redis.set).toHaveBeenCalledWith(
      'rota:tomtom:-23.31030,-51.16280:-23.33350,-51.13010',
      JSON.stringify({ distanciaKm: 5.432, duracaoMinutos: 11 }),
      'EX',
      604800,
    );
  });

  it('reaproveita a rota do cache sem chamar a TomTom', async () => {
    global.fetch = jest.fn();
    const { service } = criarService(
      'chave',
      JSON.stringify({ distanciaKm: 7, duracaoMinutos: 12 }),
    );

    await expect(service.calcular(pontos)).resolves.toEqual({
      distanciaKm: 7,
      duracaoMinutos: 12,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('usa a estimativa Haversine quando não há chave configurada', async () => {
    global.fetch = jest.fn();
    const { service, haversine } = criarService(undefined);

    await expect(service.calcular(pontos)).resolves.toEqual(
      await haversine.calcular(pontos),
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('usa a estimativa Haversine quando a TomTom falha', async () => {
    global.fetch = jest.fn().mockReturnValue(respostaTomTom({}, false));
    const { service, haversine, redis } = criarService('chave');

    await expect(service.calcular(pontos)).resolves.toEqual(
      await haversine.calcular(pontos),
    );
    expect(redis.set).not.toHaveBeenCalled();
  });
});
