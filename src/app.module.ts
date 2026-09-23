import { AutenticacaoModule } from '@module/autenticacao/autenticacao.module';
import { MotoristaModule } from '@module/usuario/motorista/motorista.module';
import { MotoristaOperacionalModule } from '@module/motorista/motorista.module';
import { ColaboradorModule } from '@module/usuario/colaborador/colaborador.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { FornecedorModule } from '@module/fornecedor/fornecedor.module';
import { FilialModule } from '@module/filial/filial.module';
import { CentroDeCustoModule } from '@module/centro-de-custo/centro-de-custo.module';
import { ContratoModule } from '@module/contrato/contrato.module';
import { MotivoModule } from '@module/motivo/motivo.module';
import { SolicitacaoModule } from '@module/solicitacao/solicitacao.module';
import { RedisModule } from '@core/redis/redis.module';
import { LogRequisicaoMiddleware } from '@common/middlewares/log-requisicao.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { TrackingModule } from '@module/tracking/tracking.module';
import { NotificacaoModule } from '@module/notificacao/notificacao.module';
import { DashboardModule } from '@module/dashboard/dashboard.module';
import { CorridaModule } from '@module/corrida/corrida.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AutenticacaoModule,
    UsuarioInfoModule,
    MotoristaModule,
    MotoristaOperacionalModule,
    ColaboradorModule,
    FornecedorModule,
    FilialModule,
    CentroDeCustoModule,
    ContratoModule,
    MotivoModule,
    SolicitacaoModule,
    NotificacaoModule,
    TrackingModule,
    DashboardModule,
    CorridaModule,
    RouterModule.register([
      {
        path: 'autenticacao',
        module: AutenticacaoModule,
      },
      {
        path: 'usuario',
        children: [
          {
            path: 'info',
            module: UsuarioInfoModule,
          },
          {
            path: 'motorista',
            module: MotoristaModule,
          },
          {
            path: 'colaborador',
            module: ColaboradorModule,
          },
        ],
      },
      {
        path: 'motorista',
        module: MotoristaOperacionalModule,
      },
      {
        path: 'fornecedor',
        module: FornecedorModule,
      },
      {
        path: 'filial',
        module: FilialModule,
      },
      {
        path: 'centro-de-custo',
        module: CentroDeCustoModule,
      },
      {
        path: 'contrato',
        module: ContratoModule,
      },
      {
        path: 'motivo',
        module: MotivoModule,
      },
      {
        path: 'solicitacoes',
        module: SolicitacaoModule,
      },
      {
        path: 'notificacoes',
        module: NotificacaoModule,
      },
      {
        path: 'corridas',
        module: TrackingModule,
      },
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LogRequisicaoMiddleware).forRoutes('*');
  }
}
