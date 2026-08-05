import { Plataforma } from '@common/enums/plataforma.enum';
import { PasswordHasherServiceContract } from '@core/auth/contracts/password-hasher-service.contract';
import { TokenCacheServiceContract } from '@core/auth/contracts/token-cache-service.contract';
import { TokenServiceContract } from '@core/auth/contracts/token-service.contract';
import { Injectable } from '@nestjs/common';
import { CredenciaisInvalidasException } from '../exceptions/credenciais-invalidas.exception';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';

@Injectable()
export class LoginService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly passwordHasherService: PasswordHasherServiceContract,
    private readonly tokenCacheService: TokenCacheServiceContract,
    private readonly tokenService: TokenServiceContract,
  ) {}

  async execute(
    email: string,
    senha: string,
    plataforma: Plataforma,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    validade: number;
  }> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao) {
      throw new CredenciaisInvalidasException();
    }

    if (!autenticacao.senha) {
      throw new CredenciaisInvalidasException();
    }

    const senhaValida = await this.passwordHasherService.compare(
      senha,
      autenticacao.senha,
    );

    if (!senhaValida) {
      throw new CredenciaisInvalidasException();
    }

    const perfis = await this.autenticacaoRepository.buscarPerfisVigentes(
      autenticacao.usuario.id,
    );

    const tokens = await this.tokenService.gerarTokens(
      {
        sub: autenticacao.usuario.id,
        email: autenticacao.usuario.email,
        plataforma,
        perfis,
      },
      { sub: autenticacao.usuario.id, plataforma, perfis },
    );

    await this.tokenCacheService.salvar(
      autenticacao.usuario.id,
      plataforma,
      tokens.refreshToken,
      tokens.validade
    );

    return tokens;
  }
}
