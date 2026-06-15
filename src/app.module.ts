import { AutenticacaoModule } from '@module/autenticacao/autenticacao.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    AutenticacaoModule,
    RouterModule.register([
      {
        path: 'autenticacao',
        module: AutenticacaoModule
      }
    ])
  ],
})
export class AppModule {}
