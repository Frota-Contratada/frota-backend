import { AccessTokenPayload } from '../types/access-token-payload';
import { AuthToken } from '../types/auth-token';
import { RefreshTokenPayload } from '../types/refresh-token-payload';

export abstract class TokenServiceContract {
  abstract gerarTokens(
    access: AccessTokenPayload,
    refresh: RefreshTokenPayload,
  ): Promise<AuthToken>;
  abstract validarAccessToken(token: string): Promise<boolean>;
  abstract validarRefreshToken(token: string): Promise<boolean>;
  abstract decodificar<T>(token: string): Promise<T>;
}
