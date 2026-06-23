import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Plataforma } from '@common/enums/plataforma.enum';
import { TokenCacheServiceContract } from '@core/auth/contracts/token-cache-service.contract';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisTokenCacheService extends TokenCacheServiceContract {

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async salvar(
    usuarioId: number,
    plataforma: Plataforma,
    refreshToken: string,
    validade: number
  ): Promise<void> {
    await this.redis.set(this.chave(usuarioId, plataforma), refreshToken, 'EX', validade);
  }

  async encontrarPorUsuarioIdPlataforma(
    usuarioId: number,
    plataforma: Plataforma,
  ): Promise<string | null> {
    return this.redis.get(this.chave(usuarioId, plataforma));
  }

  async deletarPorUsuarioIdPlataforma(
    usuarioId: number,
    plataforma: Plataforma,
  ): Promise<void> {
    await this.redis.del(this.chave(usuarioId, plataforma));
  }

  private chave(usuarioId: number, plataforma: Plataforma): string {
    return `refresh-token:${usuarioId}:${plataforma}`;
  }
}
