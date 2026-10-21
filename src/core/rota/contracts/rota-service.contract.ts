import { DateTime } from 'luxon';
import { CoordenadaInterface } from '../interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '../interfaces/rota-calculada.interface';

export interface OpcoesCalculoRota {
  partida?: DateTime;
}

export abstract class RotaServiceContract {
  abstract calcular(
    pontos: CoordenadaInterface[],
    opcoes?: OpcoesCalculoRota,
  ): Promise<RotaCalculadaInterface>;
  abstract estimarDuracaoMinutos(distanciaKm: number): number;
}
