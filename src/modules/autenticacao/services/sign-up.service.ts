import { Injectable } from '@nestjs/common';
import { TipoToken } from '../enums/tipo-token.enum';
import { PinRepositoryContract } from '../repositories/pin-repository.contract';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao-repository.contract';
import { PasswordHasherServiceContract } from '@core/auth/contracts/password-hasher-service.contract';
import { CredenciaisInvalidasException } from '../exceptions/credenciais-invalidas.exception';

@Injectable()
export class SignUpService {
  constructor(
    private readonly pinRepository: PinRepositoryContract,
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly passwordHasherService: PasswordHasherServiceContract,
  ) {}

  async execute(token: string, novaSenha: string): Promise<void> {
    const tokenAtivo = await this.pinRepository.encontrarTokenAtivo(
      token,
      TipoToken.REDEFINIR_SENHA,
    );

    if (!tokenAtivo) {
      throw new CredenciaisInvalidasException();
    }

    const senhaHasheada = await this.passwordHasherService.hash(novaSenha);

    await this.autenticacaoRepository.atualizarSenha(
      tokenAtivo.usuarioId,
      senhaHasheada,
    );

    await this.pinRepository.marcarComoUtilizado(tokenAtivo.id);
  }
}