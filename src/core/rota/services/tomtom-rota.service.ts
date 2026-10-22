import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import z from 'zod';
import { RotaServiceContract } from '../contracts/rota-service.contract';
import { RotaInsuficienteException } from '../exceptions/rota-insuficiente.exception';
import { CoordenadaInterface } from '../interfaces/coordenada.interface';
import { RotaCalculadaInterface } from '../interfaces/rota-calculada.interface';
import { HaversineRotaService } from './haversine-rota.service';

const TomTomResumoSchema = z.object({
  routes: z
    .array(
      z.object({
        summary: z.object({
          lengthInMeters: z.number().nonnegative(),
          travelTimeInSeconds: z.number().nonnegative(),
        }),
      }),
    )
    .min(1),
});

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
  private readonly timeoutMs: number;

  constructor(
    config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly haversineRotaService: HaversineRotaService,
  ) {
    super();
    this.apiKey = config.get<string>('TOMTOM_API_KEY')?.trim() ?? '';
    const timeoutConfigurado = Number(
      config.get<string>('TOMTOM_TIMEOUT_MS') ?? 8_000,
    );
    this.timeoutMs = Number.isFinite(timeoutConfigurado)
      ? Math.max(100, timeoutConfigurado)
      : 8_000;
  }

  async calcular(
    pontos: CoordenadaInterface[],
  ): Promise<RotaCalculadaInterface> {
    if (pontos.length < 2) {
      throw new RotaInsuficienteException();
    }

    if (!this.apiKey) {
      return this.haversineRotaService.calcular(pontos);
    }

    const chave = this.chaveDeCache(pontos);
    const emCache = await this.lerCache(chave);
    if (emCache != null) return emCache;

    try {
      const rota = await this.consultarTomTom(pontos);
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

  private async consultarTomTom(
    pontos: CoordenadaInterface[],
  ): Promise<RotaCalculadaInterface> {
    const locais = pontos
      .map((ponto) => `${ponto.latitude},${ponto.longitude}`)
      .join(':');
    const url = new URL(
      `https://api.tomtom.com/routing/1/calculateRoute/${locais}/json`,
    );
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('travelMode', 'car');
    url.searchParams.set('routeType', 'fastest');
    url.searchParams.set('traffic', 'false');
    url.searchParams.set('routeRepresentation', 'summaryOnly');

    const resposta = await fetch(url, {
      signal: AbortSignal.timeout(this.timeoutMs),
      headers: { Accept: 'application/json' },
    });

    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }

    const resumo = TomTomResumoSchema.parse(await resposta.json()).routes[0]
      .summary;

    return {
      distanciaKm: Math.round(resumo.lengthInMeters) / 1000,
      duracaoMinutos: Math.ceil(resumo.travelTimeInSeconds / 60),
    };
  }

  private chaveDeCache(pontos: CoordenadaInterface[]): string {
    return `rota:tomtom:${pontos
      .map(
        (ponto) => `${ponto.latitude.toFixed(5)},${ponto.longitude.toFixed(5)}`,
      )
      .join(':')}`;
  }

  private async lerCache(
    chave: string,
  ): Promise<RotaCalculadaInterface | null> {
    try {
      const valor = await this.redis.get(chave);
      return valor == null
        ? null
        : (JSON.parse(valor) as RotaCalculadaInterface);
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
