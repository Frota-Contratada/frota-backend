import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { QueueModule } from '@core/queue/queue.module';
import { ContarNotificacoesNaoLidasController } from './controllers/contar-notificacoes-nao-lidas.controller';
import { ListarNotificacoesController } from './controllers/listar-notificacoes.controller';
import { MarcarNotificacaoComoLidaController } from './controllers/marcar-notificacao-como-lida.controller';
import { NotificacaoEventsService } from './gateways/notificacao-events.service';
import { NotificacaoGateway } from './gateways/notificacao.gateway';
import { NotificacaoQueueContract } from './queue/notificacao-queue.contract';
import { BullMqNotificacaoQueue } from './queue/bullmq-notificacao.queue';
import { ProcessarNotificacaoWorker } from './queue/processar-notificacao.worker';
import { NotificacaoRepositoryContract } from './repositories/notificacao-repository.contract';
import { RedisNotificacaoRepository } from './repositories/redis-notificacao.repository';
import { AgendarLembreteDaSolicitacaoService } from './services/agendar-lembrete-da-solicitacao.service';
import { CancelarNotificacoesDaSolicitacaoService } from './services/cancelar-notificacoes-da-solicitacao.service';
import { ContarNotificacoesNaoLidasService } from './services/contar-notificacoes-nao-lidas.service';
import { ListarNotificacoesService } from './services/listar-notificacoes.service';
import { MarcarNotificacaoComoLidaService } from './services/marcar-notificacao-como-lida.service';

@Module({
  imports: [AuthModule, QueueModule],
  controllers: [
    ListarNotificacoesController,
    ContarNotificacoesNaoLidasController,
    MarcarNotificacaoComoLidaController,
  ],
  providers: [
    AgendarLembreteDaSolicitacaoService,
    CancelarNotificacoesDaSolicitacaoService,
    ContarNotificacoesNaoLidasService,
    ListarNotificacoesService,
    MarcarNotificacaoComoLidaService,
    NotificacaoEventsService,
    NotificacaoGateway,
    ProcessarNotificacaoWorker,
    {
      provide: NotificacaoRepositoryContract,
      useClass: RedisNotificacaoRepository,
    },
    {
      provide: NotificacaoQueueContract,
      useClass: BullMqNotificacaoQueue,
    },
  ],
  exports: [
    AgendarLembreteDaSolicitacaoService,
    CancelarNotificacoesDaSolicitacaoService,
  ],
})
export class NotificacaoModule {}
