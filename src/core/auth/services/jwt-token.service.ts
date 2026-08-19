import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenServiceContract } from '../contracts/token-service.contract';
import { AccessTokenPayload } from '../types/access-token-payload';
import { RefreshTokenPayload } from '../types/refresh-token-payload';
import { AuthToken } from '../types/auth-token';
import { randomUUID } from 'crypto';

@Injectable()
export class JwtTokenService extends TokenServiceContract {
  private readonly refreshSecret: string;
  private readonly accessSecret: string;
  private readonly refreshExpiresIn: number;
  private readonly accessExpiresIn: number;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    super();
    this.refreshSecret = configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshExpiresIn = Number(
      configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
    );
    this.accessExpiresIn = Number(
      configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
    );
  }

  async gerarTokens(
    access: AccessTokenPayload,
    refresh: RefreshTokenPayload,
  ): Promise<AuthToken> {
    const refreshJti = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(access, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(
        { ...refresh, jti: refreshJti },
        {
          secret: this.refreshSecret,
          expiresIn: this.refreshExpiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      validade: this.accessExpiresIn,
      validadeRefresh: this.refreshExpiresIn,
    };
  }

  async gerarRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });
  }

  async validarAccessToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.accessSecret,
      });
      return true;
    } catch {
      return false;
    }
  }

  async validarRefreshToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.refreshSecret,
      });
      return true;
    } catch {
      return false;
    }
  }

  async decodificar<T>(token: string): Promise<T> {
    const decoded = this.jwtService.decode<T>(token);
    return decoded;
  }
}
