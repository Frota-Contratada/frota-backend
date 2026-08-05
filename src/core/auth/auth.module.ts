import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Argon2PasswordHasherService } from './services/argon2-password-hasher.service';
import { JwtTokenService } from './services/jwt-token.service';
import { RedisTokenCacheService } from './services/redis-token-cache.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { PerfilGuard } from './guards/perfil.guard';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasherServiceContract } from './contracts/password-hasher-service.contract';
import { TokenServiceContract } from './contracts/token-service.contract';
import { TokenCacheServiceContract } from './contracts/token-cache-service.contract';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: PasswordHasherServiceContract,
      useClass: Argon2PasswordHasherService,
    },
    { provide: TokenServiceContract, useClass: JwtTokenService },
    { provide: TokenCacheServiceContract, useClass: RedisTokenCacheService },
    AccessTokenGuard,
    PerfilGuard,
    { provide: APP_GUARD, useExisting: AccessTokenGuard },
    { provide: APP_GUARD, useExisting: PerfilGuard },
  ],
  exports: [
    PasswordHasherServiceContract,
    TokenServiceContract,
    TokenCacheServiceContract,
    AccessTokenGuard,
  ],
})
export class AuthModule {}
