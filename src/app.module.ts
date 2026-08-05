import { AutenticacaoModule } from '@module/autenticacao/autenticacao.module';
import { MotoristaModule } from '@module/usuario/motorista/motorista.module';
import { FornecedorModule } from '@module/fornecedor/fornecedor.module';
import { FilialModule } from '@module/filial/filial.module';
import { CentroDeCustoModule } from '@module/centro-de-custo/centro-de-custo.module';
import { RedisModule } from '@core/redis/redis.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    AutenticacaoModule,
    MotoristaModule,
    FornecedorModule,
    FilialModule,
    CentroDeCustoModule,
    RouterModule.register([
      {
        path: 'autenticacao',
        module: AutenticacaoModule,
      },
      {
        path: 'usuario',
        module: MotoristaModule,
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
    ]),
  ],
})
export class AppModule {}
