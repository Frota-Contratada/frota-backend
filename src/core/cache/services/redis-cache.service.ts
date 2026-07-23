// import { Injectable } from '@nestjs/common';
// import { RedisService } from '@liaoliaots/nestjs-redis';
// import { CacheServiceContract } from '../contracts/cache-service.contract';

// @Injectable()
// export class RedisCacheService implements CacheServiceContract {
//   constructor(private readonly redisService: RedisService) {}

//   async get<T>(key: string): Promise<T | null> {
//     const redis = this.redisService.getOrThrow();

//     const value = await redis.get(key);

//     return value ? JSON.parse(value) : null;
//   }

//   async set(
//     key: string,
//     value: unknown,
//     ttlInSeconds?: number,
//   ): Promise<void> {
//     const redis = this.redisService.getOrThrow();

//     const serialized = JSON.stringify(value);

//     if (ttlInSeconds) {
//       await redis.set(key, serialized, 'EX', ttlInSeconds);
//       return;
//     }

//     await redis.set(key, serialized);
//   }

//   async delete(key: string): Promise<void> {
//     const redis = this.redisService.getOrThrow();

//     await redis.del(key);
//   }
// }