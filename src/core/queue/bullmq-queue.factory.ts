import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions, Job, Queue, Worker } from 'bullmq';

export interface BullMqQueueOptions {
  prefix: string;
}

export interface BullMqWorkerOptions extends BullMqQueueOptions {
  concurrency: number;
}

@Injectable()
export class BullMqQueueFactory {
  private readonly connection: ConnectionOptions;

  constructor(configService: ConfigService) {
    this.connection = this.criarConexao(configService);
  }

  criarFila<T>(
    nome: string,
    options: BullMqQueueOptions,
  ): Queue<T> {
    return new Queue<T>(nome, {
      connection: this.connection,
      prefix: options.prefix,
    });
  }

  criarWorker<T>(
    nome: string,
    processador: (job: Job<T>) => Promise<void>,
    options: BullMqWorkerOptions,
  ): Worker<T> {
    return new Worker<T>(nome, processador, {
      connection: this.connection,
      prefix: options.prefix,
      concurrency: options.concurrency,
    });
  }

  private criarConexao(configService: ConfigService): ConnectionOptions {
    const redisUrl = new URL(configService.getOrThrow<string>('REDIS_URL'));
    const db = Number.parseInt(redisUrl.pathname.slice(1), 10);

    return {
      host: redisUrl.hostname,
      port: Number.parseInt(redisUrl.port || '6379', 10),
      username: redisUrl.username
        ? decodeURIComponent(redisUrl.username)
        : undefined,
      password:
        configService.get<string>('REDIS_PASSWORD') ||
        (redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined),
      db: Number.isInteger(db) ? db : undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  }
}
