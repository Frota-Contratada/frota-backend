import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { Prisma, PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly transacaoStorage =
    new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor() {
    const adapter = new PrismaMssql(process.env.DATABASE_URL!);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get cliente(): Prisma.TransactionClient {
    return this.transacaoStorage.getStore() ?? this;
  }

  async executarEmTransacao<T>(operacao: () => Promise<T>): Promise<T> {
    if (this.transacaoStorage.getStore()) {
      return operacao();
    }

    return this.$transaction(
      (transacao) => this.transacaoStorage.run(transacao, operacao),
      { timeout: 15_000 },
    );
  }
}
