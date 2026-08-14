import { Module } from '@nestjs/common';
import { TransactionManagerContract } from './contracts/transaction-manager.contract';
import { TransacaoInterceptor } from './interceptors/transacao.interceptor';
import { PrismaTransactionManagerService } from './services/prisma-transaction-manager.service';
import { PrismaService } from './services/prisma.service';

@Module({
  providers: [
    PrismaService,
    TransacaoInterceptor,
    {
      provide: TransactionManagerContract,
      useClass: PrismaTransactionManagerService,
    },
  ],
  exports: [PrismaService, TransactionManagerContract, TransacaoInterceptor],
})
export class PrismaModule {}
