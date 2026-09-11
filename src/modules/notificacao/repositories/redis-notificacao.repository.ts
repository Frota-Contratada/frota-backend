import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import {
  AgendamentoNotificacao,
  Notificacao,
  StatusAgendamentoNotificacao,
} from '../domain/notificacao';
import {
  NotificacaoRepositoryContract,
  STATUS_AGENDAMENTO_VALIDOS,
} from './notificacao-repository.contract';

@Injectable()
export class RedisNotificacaoRepository extends NotificacaoRepositoryContract {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async salvarAgendamento(agendamento: AgendamentoNotificacao): Promise<void> {
    const ttlEmSegundos = this.ttlEmSegundos(agendamento.expiraEm);
    const indice = this.indiceAgendamentosDaSolicitacao(
      agendamento.solicitacaoId,
    );
    const transaction = this.redis.multi();

    transaction.set(
      this.chaveAgendamento(agendamento.id),
      JSON.stringify(agendamento),
      'EX',
      ttlEmSegundos,
    );
    transaction.set(
      this.chaveStatusAgendamento(agendamento.id),
      StatusAgendamentoNotificacao.AGENDADA,
      'EX',
      ttlEmSegundos,
    );
    transaction.sadd(indice, agendamento.id);
    transaction.expire(indice, ttlEmSegundos);

    await transaction.exec();
  }

  async buscarAgendamento(
    agendamentoId: string,
  ): Promise<AgendamentoNotificacao | null> {
    const [serializado, status] = await this.redis.mget(
      this.chaveAgendamento(agendamentoId),
      this.chaveStatusAgendamento(agendamentoId),
    );

    if (!serializado || !status || !STATUS_AGENDAMENTO_VALIDOS.has(status)) {
      return null;
    }

    const agendamento = this.desserializar<AgendamentoNotificacao>(serializado);
    if (!agendamento) return null;

    return {
      ...agendamento,
      status: status as StatusAgendamentoNotificacao,
    };
  }

  async listarAgendamentosDaSolicitacao(
    solicitacaoId: number,
  ): Promise<AgendamentoNotificacao[]> {
    const indice = this.indiceAgendamentosDaSolicitacao(solicitacaoId);
    const ids = await this.redis.smembers(indice);
    if (ids.length === 0) return [];

    const agendamentos = await Promise.all(
      ids.map((id) => this.buscarAgendamento(id)),
    );
    const idsExpirados = ids.filter((_, indiceId) => !agendamentos[indiceId]);

    if (idsExpirados.length > 0) {
      await this.redis.srem(indice, ...idsExpirados);
    }

    return agendamentos.filter(
      (agendamento): agendamento is AgendamentoNotificacao =>
        agendamento != null,
    );
  }

  async cancelarAgendamento(
    agendamentoId: string,
  ): Promise<AgendamentoNotificacao | null> {
    const agendamento = await this.buscarAgendamento(agendamentoId);
    if (!agendamento) return null;

    await this.redis.set(
      this.chaveStatusAgendamento(agendamentoId),
      StatusAgendamentoNotificacao.CANCELADA,
      'KEEPTTL',
    );

    return {
      ...agendamento,
      status: StatusAgendamentoNotificacao.CANCELADA,
    };
  }

  async iniciarEntrega(
    agendamentoId: string,
  ): Promise<AgendamentoNotificacao | null> {
    const atualizado = await this.trocarStatusSeAtual(
      agendamentoId,
      StatusAgendamentoNotificacao.AGENDADA,
      StatusAgendamentoNotificacao.ENTREGANDO,
    );
    if (!atualizado) return null;

    const agendamento = await this.buscarAgendamento(agendamentoId);
    return agendamento?.status === StatusAgendamentoNotificacao.ENTREGANDO
      ? agendamento
      : null;
  }

  async persistirNotificacoes(
    agendamento: AgendamentoNotificacao,
  ): Promise<Notificacao[]> {
    const ttlEmSegundos = this.ttlEmSegundos(agendamento.expiraEm);
    const criadaEm = new Date().toISOString();
    const notificacoes = agendamento.notificacoes.map<Notificacao>(
      (conteudo) => ({
        ...conteudo,
        agendamentoId: agendamento.id,
        criadaEm,
        expiraEm: agendamento.expiraEm,
        lidaEm: null,
      }),
    );
    const transaction = this.redis.multi();

    for (const notificacao of notificacoes) {
      const indiceDoUsuario = this.indiceDoUsuario(notificacao.usuarioId);
      const indiceNaoLidas = this.indiceNaoLidasDoUsuario(
        notificacao.usuarioId,
      );
      const score = Date.parse(criadaEm);

      transaction.set(
        this.chaveNotificacao(notificacao.id),
        JSON.stringify(notificacao),
        'EX',
        ttlEmSegundos,
      );
      transaction.zadd(indiceDoUsuario, score, notificacao.id);
      transaction.zadd(indiceNaoLidas, score, notificacao.id);
      transaction.expire(indiceDoUsuario, ttlEmSegundos);
      transaction.expire(indiceNaoLidas, ttlEmSegundos);
    }

    await transaction.exec();
    return notificacoes;
  }

  async finalizarEntrega(agendamentoId: string): Promise<boolean> {
    return this.trocarStatusSeAtual(
      agendamentoId,
      StatusAgendamentoNotificacao.ENTREGANDO,
      StatusAgendamentoNotificacao.ENTREGUE,
    );
  }

  async liberarEntrega(agendamentoId: string): Promise<void> {
    await this.trocarStatusSeAtual(
      agendamentoId,
      StatusAgendamentoNotificacao.ENTREGANDO,
      StatusAgendamentoNotificacao.AGENDADA,
    );
  }

  async removerNotificacoesDoAgendamento(
    agendamento: AgendamentoNotificacao,
  ): Promise<void> {
    if (agendamento.notificacoes.length === 0) return;

    const transaction = this.redis.multi();
    for (const notificacao of agendamento.notificacoes) {
      transaction.del(this.chaveNotificacao(notificacao.id));
      transaction.zrem(
        this.indiceDoUsuario(notificacao.usuarioId),
        notificacao.id,
      );
      transaction.zrem(
        this.indiceNaoLidasDoUsuario(notificacao.usuarioId),
        notificacao.id,
      );
    }

    await transaction.exec();
  }

  async listarPorUsuario(
    usuarioId: number,
    limite: number,
  ): Promise<Notificacao[]> {
    const indice = this.indiceDoUsuario(usuarioId);
    await this.limparReferenciasExpiradas(usuarioId, indice);

    const ids = await this.redis.zrevrange(indice, 0, limite - 1);
    if (ids.length === 0) return [];

    const valores = await this.redis.mget(
      ...ids.map((id) => this.chaveNotificacao(id)),
    );

    return valores.flatMap((valor) => {
      const notificacao = valor ? this.desserializar<Notificacao>(valor) : null;
      return notificacao?.usuarioId === usuarioId ? [notificacao] : [];
    });
  }

  async contarNaoLidas(usuarioId: number): Promise<number> {
    const indice = this.indiceNaoLidasDoUsuario(usuarioId);
    await this.limparReferenciasExpiradas(usuarioId, indice);
    return this.redis.zcard(indice);
  }

  async marcarComoLida(
    usuarioId: number,
    notificacaoId: string,
  ): Promise<Notificacao | null> {
    const chave = this.chaveNotificacao(notificacaoId);
    const [serializado, ttlEmMs] = await Promise.all([
      this.redis.get(chave),
      this.redis.pttl(chave),
    ]);
    const notificacao = serializado
      ? this.desserializar<Notificacao>(serializado)
      : null;

    if (!notificacao || notificacao.usuarioId !== usuarioId || ttlEmMs <= 0) {
      return null;
    }

    const atualizada: Notificacao = {
      ...notificacao,
      lidaEm: notificacao.lidaEm ?? new Date().toISOString(),
    };
    const transaction = this.redis.multi();
    transaction.set(chave, JSON.stringify(atualizada), 'PX', ttlEmMs);
    transaction.zrem(this.indiceNaoLidasDoUsuario(usuarioId), notificacaoId);
    await transaction.exec();

    return atualizada;
  }

  private async trocarStatusSeAtual(
    agendamentoId: string,
    esperado: StatusAgendamentoNotificacao,
    proximo: StatusAgendamentoNotificacao,
  ): Promise<boolean> {
    const resultado = await this.redis.eval(
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end redis.call('SET', KEYS[1], ARGV[2], 'KEEPTTL') return 1",
      1,
      this.chaveStatusAgendamento(agendamentoId),
      esperado,
      proximo,
    );

    return Number(resultado) === 1;
  }

  private async limparReferenciasExpiradas(
    usuarioId: number,
    indice: string,
  ): Promise<void> {
    const ids = await this.redis.zrange(indice, 0, -1);
    if (ids.length === 0) return;

    const valores = await this.redis.mget(
      ...ids.map((id) => this.chaveNotificacao(id)),
    );
    const expiradas = ids.filter(
      (id, indiceId) => !this.desserializar<Notificacao>(valores[indiceId]),
    );

    if (expiradas.length === 0) return;

    const transaction = this.redis.multi();
    transaction.zrem(indice, ...expiradas);
    transaction.zrem(
      this.outroIndiceDoUsuario(usuarioId, indice),
      ...expiradas,
    );
    await transaction.exec();
  }

  private ttlEmSegundos(expiraEm: string): number {
    return Math.max(1, Math.ceil((Date.parse(expiraEm) - Date.now()) / 1_000));
  }

  private desserializar<T>(valor: string | null | undefined): T | null {
    if (!valor) return null;

    try {
      return JSON.parse(valor) as T;
    } catch {
      return null;
    }
  }

  private chaveAgendamento(agendamentoId: string): string {
    return `notificacoes:agendamento:${agendamentoId}`;
  }

  private chaveStatusAgendamento(agendamentoId: string): string {
    return `notificacoes:agendamento-status:${agendamentoId}`;
  }

  private indiceAgendamentosDaSolicitacao(solicitacaoId: number): string {
    return `notificacoes:agendamentos:solicitacao:${solicitacaoId}`;
  }

  private chaveNotificacao(notificacaoId: string): string {
    return `notificacoes:inbox:${notificacaoId}`;
  }

  private indiceDoUsuario(usuarioId: number): string {
    return `notificacoes:usuario:${usuarioId}`;
  }

  private indiceNaoLidasDoUsuario(usuarioId: number): string {
    return `notificacoes:usuario:${usuarioId}:nao-lidas`;
  }

  private outroIndiceDoUsuario(usuarioId: number, indice: string): string {
    return indice === this.indiceDoUsuario(usuarioId)
      ? this.indiceNaoLidasDoUsuario(usuarioId)
      : this.indiceDoUsuario(usuarioId);
  }
}
