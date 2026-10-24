import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { CoordenadaInterface } from '@core/rota/interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '@core/rota/interfaces/rota-calculada.interface';

@Injectable()
export class CalcularRotaSolicitacaoService {
  constructor(private readonly rotaService: RotaServiceContract) {}

  execute(
    pontos: CoordenadaInterface[],
    partida?: DateTime,
  ): Promise<RotaCalculadaInterface> {
    return this.rotaService.calcular(pontos, { partida });
  }
}
