export abstract class CacheServiceContract {
  abstract get<T>(key: string): Promise<T | null>;

  abstract set(
    key: string,
    value: unknown,
    ttlInSeconds?: number,
  ): Promise<void>;

  abstract delete(key: string): Promise<void>;
}