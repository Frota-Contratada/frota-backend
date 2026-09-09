import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions, Queue, Worker } from 'bullmq';
import { ProcessarNotificacaoWorker } from './processar-notificacao.worker';
import {
  EnfileirarNotificacaoInput,
  JobEntregarNotificacao,
  NotificacoesQueueContract,
} from './notificacoes-queue.contract';

const NOME_FILA = 'entregas';
const PREFIXO_FILA = 'bull:notificacoes';

@Injectable()
export class BullMqNotificacoesQueue
  extends NotificacoesQueueContract
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BullMqNotificacoesQueue.name);
  private queue?: Queue<JobEntregarNotificacao>;
  private worker?: Worker<JobEntregarNotificacao>;

  constructor(
    private readonly configService: ConfigService,
    private readonly processarNotificacao: ProcessarNotificacaoWorker,
  ) {
    super();
  }

  onModuleInit(): void {
    const connection = this.criarConexao();
    this.queue = new Queue<JobEntregarNotificacao>(NOME_FILA, {
      connection,
      prefix: PREFIXO_FILA,
    });
    this.worker = new Worker<JobEntregarNotificacao>(
      NOME_FILA,
      async (job) => this.processarNotificacao.executar(job.data),
      {
        connection,
        prefix: PREFIXO_FILA,
        concurrency: this.valorPositivo('NOTIFICACOES_WORKER_CONCURRENCY', 5),
      },
    );
  }

  async enfileirar(input: EnfileirarNotificacaoInput): Promise<void> {
    await this.obterFila().add(
      'entregar-notificacao',
      { agendamentoId: input.agendamentoId },
      {
        jobId: input.jobId,
        delay: Math.max(0, input.atrasoEmMs),
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5_000,
        },
        removeOnComplete: true,
        removeOnFail: 1_000,
      },
    );
  }

  async cancelar(jobId: string): Promise<void> {
    const job = await this.obterFila().getJob(jobId);
    if (!job) return;

    try {
      await job.remove();
    } catch {
      this.logger.warn(
        `Não foi possível remover o job ${jobId}; o worker respeitará o agendamento cancelado.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.worker?.close(), this.queue?.close()]);
  }

  private obterFila(): Queue<JobEntregarNotificacao> {
    if (!this.queue) {
      throw new Error('A fila de notificações ainda não foi inicializada.');
    }

    return this.queue;
  }

  private criarConexao(): ConnectionOptions {
    const redisUrl = new URL(
      this.configService.getOrThrow<string>('REDIS_URL'),
    );
    const db = Number.parseInt(redisUrl.pathname.slice(1), 10);

    return {
      host: redisUrl.hostname,
      port: Number.parseInt(redisUrl.port || '6379', 10),
      username: redisUrl.username
        ? decodeURIComponent(redisUrl.username)
        : undefined,
      password:
        this.configService.get<string>('REDIS_PASSWORD') ||
        (redisUrl.password ? decodeURIComponent(redisUrl.password) : undefined),
      db: Number.isInteger(db) ? db : undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  }

  private valorPositivo(chave: string, padrao: number): number {
    const valor = Number(this.configService.get<string>(chave) ?? padrao);
    return Number.isInteger(valor) && valor > 0 ? valor : padrao;
  }
}
