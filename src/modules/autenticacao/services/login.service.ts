import { Plataforma } from '@common/enums/plataforma.enum';
import { PasswordHasherServiceContract } from '@core/auth/contracts/password-hasher-service.contract';
import { AuthToken } from '@core/auth/types/auth-token';
import { Injectable } from '@nestjs/common';
import { CredenciaisInvalidasException } from '../exceptions/credenciais-invalidas.exception';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';
import { GerarTokensService } from './gerar-tokens.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly passwordHasherService: PasswordHasherServiceContract,
    private readonly gerarTokensService: GerarTokensService,
  ) {}

  async execute(
    email: string,
    senha: string,
    plataforma: Plataforma,
  ): Promise<AuthToken> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao?.senha) {
      throw new CredenciaisInvalidasException();
    }

    const senhaValida = await this.passwordHasherService.compare(
      senha,
      autenticacao.senha,
    );

    if (!senhaValida) {
      throw new CredenciaisInvalidasException();
    }

    return this.gerarTokensService.execute(autenticacao.usuario, plataforma);
  }
}
