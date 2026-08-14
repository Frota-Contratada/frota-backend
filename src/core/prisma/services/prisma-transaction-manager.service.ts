import { Injectable } from '@nestjs/common';
import { TransactionManagerContract } from '../contracts/transaction-manager.contract';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionManagerService extends TransactionManagerContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async executarEmTransacao<T>(operacao: () => Promise<T>): Promise<T> {
    return this.prismaService.executarEmTransacao(operacao);
  }
}
