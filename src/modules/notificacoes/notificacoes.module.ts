import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { NotificacoesController } from './controllers/notificacoes.controller';
import { NotificacoesEventsService } from './gateways/notificacoes-events.service';
import { NotificacoesGateway } from './gateways/notificacoes.gateway';
import { NotificacaoRepositoryContract } from './repositories/notificacao-repository.contract';
import { RedisNotificacaoRepository } from './repositories/redis-notificacao.repository';
import { BullMqNotificacoesQueue } from './queue/bullmq-notificacoes.queue';
import { NotificacoesQueueContract } from './queue/notificacoes-queue.contract';
import { ProcessarNotificacaoWorker } from './queue/processar-notificacao.worker';
import { NotificacoesService } from './services/notificacoes.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificacoesController],
  providers: [
    NotificacoesEventsService,
    NotificacoesGateway,
    ProcessarNotificacaoWorker,
    NotificacoesService,
    {
      provide: NotificacaoRepositoryContract,
      useClass: RedisNotificacaoRepository,
    },
    {
      provide: NotificacoesQueueContract,
      useClass: BullMqNotificacoesQueue,
    },
  ],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
