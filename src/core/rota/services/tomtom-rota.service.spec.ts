import { TomTomClienteService } from '@integration/geocodificacao/services/tomtom-cliente.service';
import { TomTomRotaService } from './tomtom-rota.service';
import { HaversineRotaService } from './haversine-rota.service';

describe('TomTomRotaService', () => {
  const pontos = [
    { latitude: -23.3103, longitude: -51.1628 },
    { latitude: -23.3335, longitude: -51.1301 },
  ];

  const criarService = (
    apiKey?: string,
    emCache: string | null = null,
    respostaTomTom = {
      distanciaMetros: 5432,
      duracaoSegundos: 601,
      coordenadas: pontos,
    },
  ) => {
    const redis = {
      get: jest.fn().mockResolvedValue(emCache),
      set: jest.fn().mockResolvedValue('OK'),
    };
    const config = {
      get: jest.fn((chave: string) =>
        chave === 'TOMTOM_API_KEY' ? apiKey : undefined,
      ),
    };
    const tomTom = {
      configurado: Boolean(apiKey),
      calcularRota: jest.fn().mockResolvedValue(respostaTomTom),
    };
    const haversine = new HaversineRotaService();
    const service = new TomTomRotaService(
      config as never,
      redis as never,
      haversine,
      tomTom as unknown as TomTomClienteService,
    );

    return { service, redis, haversine, tomTom };
  };

  it('usa a distância por ruas da TomTom, traçado e guarda no cache', async () => {
    const { service, redis, tomTom } = criarService('chave');

    await expect(service.calcular(pontos)).resolves.toEqual({
      distanciaKm: 5.432,
      duracaoMinutos: 11,
      coordenadas: pontos,
    });
    expect(tomTom.calcularRota).toHaveBeenCalledWith(pontos, undefined);
    expect(redis.set).toHaveBeenCalledWith(
      'rota:tomtom:-23.31030,-51.16280:-23.33350,-51.13010',
      JSON.stringify({
        distanciaKm: 5.432,
        duracaoMinutos: 11,
        coordenadas: pontos,
      }),
      'EX',
      604800,
    );
  });

  it('reaproveita a rota do cache sem chamar a TomTom', async () => {
    const { service, tomTom } = criarService(
      'chave',
      JSON.stringify({ distanciaKm: 7, duracaoMinutos: 12 }),
    );

    await expect(service.calcular(pontos)).resolves.toEqual({
      distanciaKm: 7,
      duracaoMinutos: 12,
    });
    expect(tomTom.calcularRota).not.toHaveBeenCalled();
  });

  it('usa a estimativa Haversine quando não há chave configurada', async () => {
    const { service, haversine, tomTom } = criarService(undefined);

    await expect(service.calcular(pontos)).resolves.toEqual(
      await haversine.calcular(pontos),
    );
    expect(tomTom.calcularRota).not.toHaveBeenCalled();
  });

  it('usa a estimativa Haversine quando a TomTom falha', async () => {
    const { service, haversine, redis, tomTom } = criarService('chave');
    tomTom.calcularRota.mockRejectedValueOnce(new Error('falha'));

    await expect(service.calcular(pontos)).resolves.toEqual(
      await haversine.calcular(pontos),
    );
    expect(redis.set).not.toHaveBeenCalled();
  });
});
