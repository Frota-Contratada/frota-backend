import { Injectable } from '@nestjs/common';
import z from 'zod';
import { buscarJson } from '../utils/buscar-json';
import { textoOuIndefinido } from '../utils/uf';

const PROVEDOR = 'ViaCEP';
const TIMEOUT_MS = 5_000;

const ViaCepSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().optional(),
  erro: z.union([z.boolean(), z.string()]).optional(),
});

export interface EnderecoDoCep {
  cep: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

@Injectable()
export class ViaCepClienteService {
  async buscar(cep: string): Promise<EnderecoDoCep | undefined> {
    const url = new URL(`https://viacep.com.br/ws/${cep}/json/`);
    const corpo = ViaCepSchema.safeParse(
      await buscarJson(PROVEDOR, url, TIMEOUT_MS),
    );

    if (!corpo.success || corpo.data.erro != null) return undefined;

    return {
      cep,
      logradouro: textoOuIndefinido(corpo.data.logradouro),
      bairro: textoOuIndefinido(corpo.data.bairro),
      cidade: textoOuIndefinido(corpo.data.localidade),
      uf: textoOuIndefinido(corpo.data.uf)?.toUpperCase(),
    };
  }
}
