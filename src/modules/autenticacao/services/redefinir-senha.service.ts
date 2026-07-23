import { Injectable } from '@nestjs/common';
import { TipoToken } from '../enums/tipo-token.enum';
import { PinRepositoryContract } from '../repositories/pin/pin-repository.contract';
import { PasswordHasherServiceContract } from '@core/auth/contracts/password-hasher-service.contract';
import { CredenciaisInvalidasException } from '../exceptions/credenciais-invalidas.exception';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';

@Injectable()
export class RedefinirSenhaService {
  constructor(
    private readonly pinRepository: PinRepositoryContract,
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly passwordHasherService: PasswordHasherServiceContract,
  ) {}

  async execute(token: string, senha: string): Promise<void> {
    const tokenAtivo = await this.pinRepository.encontrarTokenAtivo(
      token,
      TipoToken.REDEFINIR_SENHA,
    );

    if (!tokenAtivo) {
      throw new CredenciaisInvalidasException();
    }

    const autenticacao = await this.autenticacaoRepository.buscarPorUsuarioId(
      tokenAtivo.usuarioId,
    );

    if (!autenticacao || !autenticacao?.senha) {
      throw new CredenciaisInvalidasException();
    }

    const senhaHasheada = await this.passwordHasherService.hash(senha);

    await this.autenticacaoRepository.atualizarSenha(
      tokenAtivo.usuarioId,
      senhaHasheada,
    );

    await this.pinRepository.marcarComoUtilizado(tokenAtivo.id);
  }
}
