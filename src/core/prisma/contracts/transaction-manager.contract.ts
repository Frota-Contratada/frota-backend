export abstract class TransactionManagerContract {
  abstract executarEmTransacao<T>(operacao: () => Promise<T>): Promise<T>;
}
