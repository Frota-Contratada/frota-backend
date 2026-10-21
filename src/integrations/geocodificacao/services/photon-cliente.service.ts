import { Injectable } from '@nestjs/common';
import z from 'zod';
import { ProvedorGeograficoIndisponivelException } from '../exceptions/provedor-geografico-indisponivel.exception';
import {
  EnderecoEncontrado,
  PontoGeografico,
} from '../interfaces/endereco-encontrado.interface';
import { buscarJson } from '../utils/buscar-json';
import { paraUf, somenteDigitos, textoOuIndefinido } from '../utils/uf';

const PROVEDOR = 'Photon';
const LIMITES_BRASIL = '-73.98,-33.75,-34.79,5.27';
const TIMEOUT_MS = 6_000;
const PAISES_ACEITOS = ['brazil', 'brasil'];

const BuscaPhotonSchema = z.object({
  features: z
    .array(
      z.object({
        geometry: z.object({
          coordinates: z.tuple([z.number(), z.number()]),
        }),
        properties: z
          .object({
            name: z.string().optional(),
            street: z.string().optional(),
            housenumber: z.string().optional(),
            district: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            postcode: z.string().optional(),
            country: z.string().optional(),
          })
          .default({}),
      }),
    )
    .default([]),
});

@Injectable()
export class PhotonClienteService {
  async buscarEnderecos(
    texto: string,
    limite: number,
    proximoDe?: PontoGeografico,
  ): Promise<EnderecoEncontrado[]> {
    const url = new URL('https://photon.komoot.io/api/');
    url.searchParams.set('q', texto);
    url.searchParams.set('limit', String(limite));
    url.searchParams.set('lang', 'default');
    url.searchParams.set('bbox', LIMITES_BRASIL);
    if (proximoDe != null) {
      url.searchParams.set('lat', String(proximoDe.latitude));
      url.searchParams.set('lon', String(proximoDe.longitude));
    }

    const corpo = BuscaPhotonSchema.safeParse(
      await buscarJson(PROVEDOR, url, TIMEOUT_MS),
    );
    if (!corpo.success) {
      throw new ProvedorGeograficoIndisponivelException(PROVEDOR);
    }

    return corpo.data.features
      .filter(({ properties }) => {
        const pais = properties.country?.toLowerCase();
        return pais == null || PAISES_ACEITOS.includes(pais);
      })
      .map(({ geometry, properties }) => {
        const logradouro = textoOuIndefinido(
          properties.street ?? properties.name,
        );
        const numero = textoOuIndefinido(properties.housenumber);
        const bairro = textoOuIndefinido(properties.district);
        const cidade = textoOuIndefinido(properties.city);
        const uf = paraUf(properties.state);

        return {
          descricao: [logradouro, numero, bairro, cidade, uf]
            .filter(Boolean)
            .join(', '),
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
          logradouro,
          numero,
          bairro,
          cidade,
          uf,
          cep: somenteDigitos(properties.postcode),
        };
      })
      .filter((endereco) => endereco.descricao.length > 0);
  }
}
