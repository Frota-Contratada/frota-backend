import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import z from 'zod';
import { ProvedorGeograficoIndisponivelException } from '../exceptions/provedor-geografico-indisponivel.exception';
import {
  EnderecoEncontrado,
  PontoGeografico,
} from '../interfaces/endereco-encontrado.interface';
import { buscarJson } from '../utils/buscar-json';
import { paraUf, somenteDigitos, textoOuIndefinido } from '../utils/uf';

const PROVEDOR = 'TomTom';
const ANTECEDENCIA_MINIMA_PARTIDA_MINUTOS = 1;

const RotaTomTomSchema = z.object({
  routes: z
    .array(
      z.object({
        summary: z.object({
          lengthInMeters: z.number().nonnegative(),
          travelTimeInSeconds: z.number().nonnegative(),
        }),
        legs: z.array(
          z.object({
            points: z.array(
              z.object({ latitude: z.number(), longitude: z.number() }),
            ),
          }),
        ),
      }),
    )
    .min(1),
});

const BuscaTomTomSchema = z.object({
  results: z
    .array(
      z.object({
        address: z
          .object({
            streetNumber: z.string().optional(),
            streetName: z.string().optional(),
            municipalitySubdivision: z.string().optional(),
            municipality: z.string().optional(),
            countrySecondarySubdivision: z.string().optional(),
            countrySubdivision: z.string().optional(),
            countrySubdivisionCode: z.string().optional(),
            postalCode: z.string().optional(),
            freeformAddress: z.string().optional(),
          })
          .default({}),
        position: z.object({ lat: z.number(), lon: z.number() }),
      }),
    )
    .default([]),
});

export interface RotaTomTom {
  distanciaMetros: number;
  duracaoSegundos: number;
  coordenadas: PontoGeografico[];
}

@Injectable()
export class TomTomClienteService {
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('TOMTOM_API_KEY')?.trim() || undefined;
    const timeout = Number(config.get<string>('TOMTOM_TIMEOUT_MS') ?? 8_000);
    this.timeoutMs = Number.isFinite(timeout) ? Math.max(100, timeout) : 8_000;
  }

  get configurado(): boolean {
    return this.apiKey != null;
  }

  async calcularRota(
    pontos: PontoGeografico[],
    partida?: DateTime,
  ): Promise<RotaTomTom> {
    const locais = pontos
      .map((ponto) => `${ponto.latitude},${ponto.longitude}`)
      .join(':');
    const url = new URL(
      `https://api.tomtom.com/routing/1/calculateRoute/${locais}/json`,
    );
    this.definirParametros(url, {
      travelMode: 'car',
      routeType: 'fastest',
      traffic: 'true',
      departAt: this.formatarPartida(partida),
      routeRepresentation: 'polyline',
    });

    const corpo = RotaTomTomSchema.safeParse(
      await buscarJson(PROVEDOR, url, this.timeoutMs),
    );
    if (!corpo.success) {
      throw new ProvedorGeograficoIndisponivelException(PROVEDOR);
    }

    const rota = corpo.data.routes[0];
    const coordenadas = rota.legs.flatMap((trecho, indiceTrecho) =>
      trecho.points
        .filter((_, indicePonto) => indiceTrecho === 0 || indicePonto > 0)
        .map((ponto) => ({
          latitude: ponto.latitude,
          longitude: ponto.longitude,
        })),
    );
    if (coordenadas.length < 2) {
      throw new ProvedorGeograficoIndisponivelException(PROVEDOR);
    }

    return {
      distanciaMetros: rota.summary.lengthInMeters,
      duracaoSegundos: rota.summary.travelTimeInSeconds,
      coordenadas,
    };
  }

  async buscarEnderecos(
    texto: string,
    limite: number,
    proximoDe?: PontoGeografico,
  ): Promise<EnderecoEncontrado[]> {
    const url = new URL(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(texto)}.json`,
    );
    this.definirParametros(url, {
      countrySet: 'BR',
      language: 'pt-BR',
      typeahead: 'true',
      limit: String(limite),
      ...(proximoDe == null
        ? {}
        : {
            lat: String(proximoDe.latitude),
            lon: String(proximoDe.longitude),
          }),
    });

    const corpo = BuscaTomTomSchema.safeParse(
      await buscarJson(PROVEDOR, url, this.timeoutMs),
    );
    if (!corpo.success) {
      throw new ProvedorGeograficoIndisponivelException(PROVEDOR);
    }

    return corpo.data.results.map(({ address, position }) => {
      const logradouro = textoOuIndefinido(address.streetName);
      const numero = textoOuIndefinido(address.streetNumber);
      const bairro = textoOuIndefinido(address.municipalitySubdivision);
      const cidade = textoOuIndefinido(
        address.municipality ?? address.countrySecondarySubdivision,
      );
      const uf =
        paraUf(address.countrySubdivisionCode) ??
        paraUf(address.countrySubdivision);

      return {
        descricao:
          textoOuIndefinido(address.freeformAddress) ??
          [logradouro, numero, bairro, cidade, uf].filter(Boolean).join(', '),
        latitude: position.lat,
        longitude: position.lon,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        cep: somenteDigitos(address.postalCode),
      };
    });
  }

  private definirParametros(url: URL, parametros: Record<string, string>) {
    if (this.apiKey == null) {
      throw new ProvedorGeograficoIndisponivelException(PROVEDOR);
    }
    url.searchParams.set('key', this.apiKey);
    for (const [chave, valor] of Object.entries(parametros)) {
      url.searchParams.set(chave, valor);
    }
  }

  private formatarPartida(partida?: DateTime): string {
    const limite = DateTime.now().plus({
      minutes: ANTECEDENCIA_MINIMA_PARTIDA_MINUTOS,
    });
    if (partida == null || !partida.isValid || partida <= limite) {
      return 'now';
    }
    return (
      partida.toISO({ suppressMilliseconds: true, includeOffset: true }) ??
      'now'
    );
  }
}
