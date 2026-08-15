import { AutenticacaoModule } from '@module/autenticacao/autenticacao.module';
import { MotoristaModule } from '@module/usuario/motorista/motorista.module';
import { ColaboradorModule } from '@module/usuario/colaborador/colaborador.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { FornecedorModule } from '@module/fornecedor/fornecedor.module';
import { FilialModule } from '@module/filial/filial.module';
import { CentroDeCustoModule } from '@module/centro-de-custo/centro-de-custo.module';
import { ContratoModule } from '@module/contrato/contrato.module';
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
    UsuarioInfoModule,
    MotoristaModule,
    ColaboradorModule,
    FornecedorModule,
    FilialModule,
    CentroDeCustoModule,
    ContratoModule,
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
    ]),
  ],
})
export class AppModule {}
