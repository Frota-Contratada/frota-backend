import { Module } from '@nestjs/common';
import { Argon2PasswordHasherService } from './services/argon2-password-hasher.service';
import { JwtTokenService } from './services/jwt-token.service';
import { RedisTokenCacheService } from './services/redis-token-cache.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';
import { PasswordHasherServiceContract } from './contracts/password-hasher-service.contract';
import { TokenServiceContract } from './contracts/token-service.contract';
import { TokenCacheServiceContract } from './contracts/token-cache-service.contract';

@Module({
  imports: [
    JwtModule.register({}),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: process.env.REDIS_URL
      }),
    }),
  ],
  providers: [
    { provide: PasswordHasherServiceContract, useClass: Argon2PasswordHasherService },
    { provide: TokenServiceContract, useClass: JwtTokenService },
    { provide: TokenCacheServiceContract, useClass: RedisTokenCacheService },
  ],
  exports: [
    PasswordHasherServiceContract,
    TokenServiceContract,
    TokenCacheServiceContract,
  ],
})
export class AuthModule {}