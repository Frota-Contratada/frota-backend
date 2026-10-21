import { Injectable, Logger } from '@nestjs/common';
import { TomTomClienteService } from '@integration/geocodificacao/services/tomtom-cliente.service';
import {
  OpcoesCalculoRota,
  RotaServiceContract,
} from '../contracts/rota-service.contract';
import { CoordenadaInterface } from '../interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '../interfaces/rota-calculada.interface';
import { RotaInsuficienteException } from '../exceptions/rota-insuficiente.exception';
import { HaversineRotaService } from './haversine-rota.service';

@Injectable()
export class TomTomRotaService extends RotaServiceContract {
  private readonly logger = new Logger(TomTomRotaService.name);

  constructor(
    private readonly tomTom: TomTomClienteService,
    private readonly haversine: HaversineRotaService,
  ) {
    super();
  }

  async calcular(
    pontos: CoordenadaInterface[],
    opcoes: OpcoesCalculoRota = {},
  ): Promise<RotaCalculadaInterface> {
    if (pontos.length < 2) {
      throw new RotaInsuficienteException();
    }

    if (!this.tomTom.configurado) {
      return this.haversine.calcular(pontos);
    }

    try {
      const rota = await this.tomTom.calcularRota(pontos, opcoes.partida);

      return {
        distanciaKm: Math.round(rota.distanciaMetros) / 1000,
        duracaoMinutos: Math.ceil(rota.duracaoSegundos / 60),
        coordenadas: rota.coordenadas,
      };
    } catch {
      this.logger.warn(
        'Rota do TomTom indisponível; usando a estimativa por distância.',
      );
      return this.haversine.calcular(pontos);
    }
  }

  estimarDuracaoMinutos(distanciaKm: number): number {
    return this.haversine.estimarDuracaoMinutos(distanciaKm);
  }
}
