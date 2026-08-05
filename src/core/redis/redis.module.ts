import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    IoRedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
        options: {
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
  ],
  exports: [IoRedisModule],
})
export class RedisModule {}
