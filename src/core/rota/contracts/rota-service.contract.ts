import { CoordenadaInterface } from '../interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '../interfaces/rota-calculada.interface';

export abstract class RotaServiceContract {
  abstract calcular(
    pontos: CoordenadaInterface[],
  ): Promise<RotaCalculadaInterface>;

  abstract estimarDuracaoMinutos(distanciaKm: number): number;
}
