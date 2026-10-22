import { Injectable } from '@nestjs/common';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';

@Injectable()
export class VerificarPrimeiroAcessoService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
  ) {}

  /**
   * Primeiro acesso é apenas de usuário cadastrado e ainda sem senha. E-mail
   * inexistente segue para a tela de senha e recebe o erro padrão de login,
   * sem revelar quais e-mails existem.
   */
  async execute(email: string): Promise<boolean> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao || autenticacao.senha) {
      return false;
    }

    return true;
  }
}
