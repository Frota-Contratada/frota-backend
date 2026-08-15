import { Injectable } from '@nestjs/common';
import { TokenCacheServiceContract } from '@core/auth/contracts/token-cache-service.contract';
import { TokenServiceContract } from '@core/auth/contracts/token-service.contract';
import { AuthToken } from '@core/auth/types/auth-token';
import { RefreshTokenPayload } from '@core/auth/types/refresh-token-payload';
import { RefreshTokenInvalidoException } from '../exceptions/refresh-token-invalido.exception';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';
import { GerarTokensService } from './gerar-tokens.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly tokenCacheService: TokenCacheServiceContract,
    private readonly tokenService: TokenServiceContract,
    private readonly gerarTokensService: GerarTokensService,
  ) {}

  async execute(refreshToken: string): Promise<AuthToken> {
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

    return this.gerarTokensService.execute(
      autenticacao.usuario,
      payload.plataforma,
    );
  }
}
