import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import {
  AlteracaoPreferenciasNotificacao,
  CategoriaNotificacao,
  PreferenciasNotificacao,
  preferenciasPadrao,
} from '../domain/preferencias-notificacao';
import { PreferenciasNotificacaoRepositoryContract } from './preferencias-notificacao-repository.contract';

interface PreferenciasSerializadas {
  pushAtivo?: unknown;
  categorias?: Record<string, unknown>;
  atualizadoEm?: unknown;
}

@Injectable()
export class RedisPreferenciasNotificacaoRepository extends PreferenciasNotificacaoRepositoryContract {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async buscar(usuarioId: number): Promise<PreferenciasNotificacao> {
    return this.desserializar(await this.redis.get(this.chave(usuarioId)));
  }

  async buscarPorUsuarios(
    usuarioIds: number[],
  ): Promise<Map<number, PreferenciasNotificacao>> {
    const resultado = new Map<number, PreferenciasNotificacao>();
    if (usuarioIds.length === 0) return resultado;

    const valores = await this.redis.mget(
      ...usuarioIds.map((usuarioId) => this.chave(usuarioId)),
    );
    usuarioIds.forEach((usuarioId, indice) => {
      if (valores[indice]) {
        resultado.set(usuarioId, this.desserializar(valores[indice]));
      }
    });

    return resultado;
  }

  async atualizar(
    usuarioId: number,
    alteracao: AlteracaoPreferenciasNotificacao,
  ): Promise<PreferenciasNotificacao> {
    const chave = this.chave(usuarioId);

    for (;;) {
      await this.redis.watch(chave);
      const atual = this.desserializar(await this.redis.get(chave));
      const atualizada: PreferenciasNotificacao = {
        pushAtivo: alteracao.pushAtivo ?? atual.pushAtivo,
        categorias: { ...atual.categorias },
        atualizadoEm: new Date(),
      };
      for (const [categoria, ativa] of Object.entries(
        alteracao.categorias ?? {},
      )) {
        if (ativa !== undefined) {
          atualizada.categorias[categoria as CategoriaNotificacao] = ativa;
        }
      }

      const resultado = await this.redis
        .multi()
        .set(chave, JSON.stringify(atualizada))
        .exec();
      if (resultado !== null) return atualizada;
    }
  }

  private desserializar(valor: string | null): PreferenciasNotificacao {
    const padrao = preferenciasPadrao();
    if (!valor) return padrao;

    let salvo: PreferenciasSerializadas;
    try {
      salvo = JSON.parse(valor) as PreferenciasSerializadas;
    } catch {
      return padrao;
    }

    for (const categoria of Object.values(CategoriaNotificacao)) {
      const ativa = salvo.categorias?.[categoria];
      if (typeof ativa === 'boolean') padrao.categorias[categoria] = ativa;
    }

    return {
      pushAtivo: typeof salvo.pushAtivo === 'boolean' ? salvo.pushAtivo : true,
      categorias: padrao.categorias,
      atualizadoEm:
        typeof salvo.atualizadoEm === 'string'
          ? new Date(salvo.atualizadoEm)
          : null,
    };
  }

  private chave(usuarioId: number): string {
    return `notificacoes:preferencias:${usuarioId}`;
  }
}
