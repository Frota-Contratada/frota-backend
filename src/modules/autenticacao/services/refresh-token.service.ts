import { Injectable } from '@nestjs/common';
import { TokenCacheServiceContract } from '@core/auth/contracts/token-cache-service.contract';
import { TokenServiceContract } from '@core/auth/contracts/token-service.contract';
import { RefreshTokenPayload } from '@core/auth/types/refresh-token-payload';
import { AuthToken } from '@core/auth/types/auth-token';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao-repository.contract';
import { RefreshTokenInvalidoException } from '../exceptions/refresh-token-invalido.exception';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly tokenCacheService: TokenCacheServiceContract,
    private readonly tokenService: TokenServiceContract,
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    validade: number;
  }> {
    const valido = await this.tokenService.validarRefreshToken(refreshToken);

    if (!valido) {
      throw new RefreshTokenInvalidoException();
    }

    const payload =
      await this.tokenService.decodificar<RefreshTokenPayload>(refreshToken);

    const refreshTokenSalvo =
      await this.tokenCacheService.encontrarPorUsuarioIdPlataforma(
        payload.sub,
        payload.plataforma,
      );

    if (!refreshTokenSalvo || refreshTokenSalvo !== refreshToken) {
      throw new RefreshTokenInvalidoException();
    }

    const autenticacao = await this.autenticacaoRepository.buscarPorUsuarioId(
      payload.sub,
    );

    if (!autenticacao) {
      throw new RefreshTokenInvalidoException();
    }

    const tokens = await this.tokenService.gerarTokens(
      {
        sub: autenticacao.usuario.id,
        email: autenticacao.usuario.email,
        plataforma: payload.plataforma,
      },
      { sub: autenticacao.usuario.id, plataforma: payload.plataforma },
    );

    await this.tokenCacheService.salvar(
      autenticacao.usuario.id,
      payload.plataforma,
      tokens.refreshToken,
      tokens.validade,
    );

    return tokens;
  }
}
