import { Injectable } from '@nestjs/common';
import { EmailNaoCadastradoException } from '../exceptions/email-nao-cadastrado.exception';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';

@Injectable()
export class VerificarPrimeiroAcessoService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
  ) {}

  async execute(email: string): Promise<boolean> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao) {
      throw new EmailNaoCadastradoException();
    }

    return !autenticacao.senha;
  }
}
