import { DateTime } from 'luxon';
import { TomTomClienteService } from '@integration/geocodificacao/services/tomtom-cliente.service';
import { HaversineRotaService } from './haversine-rota.service';
import { TomTomRotaService } from './tomtom-rota.service';

describe('TomTomRotaService', () => {
  const pontos = [
    { latitude: -23.3045, longitude: -51.1696 },
    { latitude: -23.3354, longitude: -51.1463 },
  ];

  const criar = (cliente: Partial<TomTomClienteService>) =>
    new TomTomRotaService(
      cliente as TomTomClienteService,
      new HaversineRotaService(),
    );

  it('usa a duração e o traçado do TomTom', async () => {
    const calcularRota = jest.fn().mockResolvedValue({
      distanciaMetros: 6_480,
      duracaoSegundos: 901,
      coordenadas: pontos,
    });
    const partida = DateTime.now().plus({ days: 1 });

    const rota = await criar({ configurado: true, calcularRota }).calcular(
      pontos,
      { partida },
    );

    expect(calcularRota).toHaveBeenCalledWith(pontos, partida);
    expect(rota).toEqual({
      distanciaKm: 6.48,
      duracaoMinutos: 16,
      coordenadas: pontos,
    });
  });

  it('usa a estimativa por distância quando o TomTom falha', async () => {
    const rota = await criar({
      configurado: true,
      calcularRota: jest.fn().mockRejectedValue(new Error('falha')),
    }).calcular(pontos);

    expect(rota.coordenadas).toBeUndefined();
    expect(rota.duracaoMinutos).toBeGreaterThan(0);
  });

  it('usa a estimativa por distância quando o TomTom não está configurado', async () => {
    const calcularRota = jest.fn();

    await criar({ configurado: false, calcularRota }).calcular(pontos);

    expect(calcularRota).not.toHaveBeenCalled();
  });
});
