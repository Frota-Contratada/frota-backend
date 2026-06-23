import { AutenticacaoModule } from '@module/autenticacao/autenticacao.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    AutenticacaoModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RouterModule.register([
      {
        path: 'autenticacao',
        module: AutenticacaoModule,
      },
    ]),
  ],
})
export class AppModule {}
