import { Injectable } from '@nestjs/common';
import { RotaServiceContract } from '../contracts/rota-service.contract';
import { CoordenadaInterface } from '../interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '../interfaces/rota-calculada.interface';
import { RotaInsuficienteException } from '../exceptions/rota-insuficiente.exception';

@Injectable()
export class HaversineRotaService extends RotaServiceContract {
  private static readonly RAIO_TERRA_KM = 6371;
  private static readonly FATOR_RODOVIARIO = 1.3;
  private static readonly VELOCIDADE_MEDIA_KMH = 50;

  calcular(pontos: CoordenadaInterface[]): Promise<RotaCalculadaInterface> {
    if (pontos.length < 2) {
      throw new RotaInsuficienteException();
    }

    let distanciaKm = 0;

    for (let indice = 1; indice < pontos.length; indice += 1) {
      distanciaKm += this.distanciaEntre(pontos[indice - 1], pontos[indice]);
    }

    distanciaKm = this.arredondar(
      distanciaKm * HaversineRotaService.FATOR_RODOVIARIO,
      3,
    );

    return Promise.resolve({
      distanciaKm,
      duracaoMinutos: this.estimarDuracaoMinutos(distanciaKm),
    });
  }

  estimarDuracaoMinutos(distanciaKm: number): number {
    if (distanciaKm <= 0) return 0;

    return Math.ceil(
      (distanciaKm / HaversineRotaService.VELOCIDADE_MEDIA_KMH) * 60,
    );
  }

  private distanciaEntre(
    origem: CoordenadaInterface,
    destino: CoordenadaInterface,
  ): number {
    const deltaLatitude = this.paraRadianos(destino.latitude - origem.latitude);
    const deltaLongitude = this.paraRadianos(
      destino.longitude - origem.longitude,
    );
    const latitudeOrigem = this.paraRadianos(origem.latitude);
    const latitudeDestino = this.paraRadianos(destino.latitude);

    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(latitudeOrigem) *
        Math.cos(latitudeDestino) *
        Math.sin(deltaLongitude / 2) ** 2;

    return (
      2 *
      HaversineRotaService.RAIO_TERRA_KM *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
  }

  private paraRadianos(graus: number): number {
    return (graus * Math.PI) / 180;
  }

  private arredondar(valor: number, casas: number): number {
    const fator = 10 ** casas;
    return Math.round(valor * fator) / fator;
  }
}
