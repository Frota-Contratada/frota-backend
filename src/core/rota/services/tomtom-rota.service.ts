import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { TomTomClienteService } from '@integration/geocodificacao/services/tomtom-cliente.service';
import {
  OpcoesCalculoRota,
  RotaServiceContract,
} from '../contracts/rota-service.contract';
import { RotaInsuficienteException } from '../exceptions/rota-insuficiente.exception';
import { CoordenadaInterface } from '../interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '../interfaces/rota-calculada.interface';
import { HaversineRotaService } from './haversine-rota.service';

/**
 * Distância e duração por ruas pela TomTom Routing API. Sem chave
 * configurada, ou se a TomTom falhar, usa a estimativa Haversine para não
 * bloquear a solicitação. Rotas iguais são reaproveitadas do cache, poupando
 * a cota gratuita da API.
 */
@Injectable()
export class TomTomRotaService extends RotaServiceContract {
  private static readonly CACHE_SEGUNDOS = 7 * 24 * 60 * 60;

  private readonly logger = new Logger(TomTomRotaService.name);
  private readonly apiKey: string;

  constructor(
    config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly haversineRotaService: HaversineRotaService,
    private readonly tomTom: TomTomClienteService,
  ) {
    super();
    this.apiKey = config.get<string>('TOMTOM_API_KEY')?.trim() ?? '';
  }

  async calcular(
    pontos: CoordenadaInterface[],
    opcoes: OpcoesCalculoRota = {},
  ): Promise<RotaCalculadaInterface> {
    if (pontos.length < 2) {
      throw new RotaInsuficienteException();
    }

    if (!this.apiKey || !this.tomTom.configurado) {
      return this.haversineRotaService.calcular(pontos);
    }

    const chave = this.chaveDeCache(pontos, opcoes.partida);
    const emCache = await this.lerCache(chave);
    if (emCache != null) return emCache;

    try {
      const rotaTomTom = await this.tomTom.calcularRota(pontos, opcoes.partida);
      const rota: RotaCalculadaInterface = {
        distanciaKm: Math.round(rotaTomTom.distanciaMetros) / 1000,
        duracaoMinutos: Math.ceil(rotaTomTom.duracaoSegundos / 60),
        coordenadas: rotaTomTom.coordenadas,
      };
      await this.gravarCache(chave, rota);
      return rota;
    } catch (erro) {
      this.logger.warn(
        `Rota TomTom indisponível, usando estimativa Haversine: ${String(erro)}`,
      );
      return this.haversineRotaService.calcular(pontos);
    }
  }

  estimarDuracaoMinutos(distanciaKm: number): number {
    return this.haversineRotaService.estimarDuracaoMinutos(distanciaKm);
  }

  private chaveDeCache(
    pontos: CoordenadaInterface[],
    partida?: OpcoesCalculoRota['partida'],
  ): string {
    const pontosNormalizados = pontos
      .map(
        (ponto) => `${ponto.latitude.toFixed(5)},${ponto.longitude.toFixed(5)}`,
      )
      .join(':');
    const partidaNormalizada = partida?.isValid
      ? `:partida=${partida.toISO({ suppressMilliseconds: true })}`
      : '';
    return `rota:tomtom:${pontosNormalizados}${partidaNormalizada}`;
  }

  private async lerCache(
    chave: string,
  ): Promise<RotaCalculadaInterface | null> {
    try {
      const valor = await this.redis.get(chave);
      if (valor == null) return null;
      const rota = JSON.parse(valor) as RotaCalculadaInterface;
      return typeof rota.distanciaKm === 'number' &&
        typeof rota.duracaoMinutos === 'number'
        ? rota
        : null;
    } catch {
      return null;
    }
  }

  private async gravarCache(
    chave: string,
    rota: RotaCalculadaInterface,
  ): Promise<void> {
    try {
      await this.redis.set(
        chave,
        JSON.stringify(rota),
        'EX',
        TomTomRotaService.CACHE_SEGUNDOS,
      );
    } catch {
      // Cache é só otimização; a rota calculada continua válida.
    }
  }
}
