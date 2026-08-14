import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { firstValueFrom, from, Observable } from 'rxjs';
import { TransactionManagerContract } from '../contracts/transaction-manager.contract';

@Injectable()
export class TransacaoInterceptor implements NestInterceptor {
  constructor(
    private readonly transactionManager: TransactionManagerContract,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return from(
      this.transactionManager.executarEmTransacao(() =>
        firstValueFrom(next.handle(), { defaultValue: undefined }),
      ),
    );
  }
}
