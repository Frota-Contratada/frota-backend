import { CoordenadaInterface } from './coordenada.interface';

export interface RotaCalculadaInterface {
  distanciaKm: number;
  duracaoMinutos: number;
  coordenadas?: CoordenadaInterface[];
}
