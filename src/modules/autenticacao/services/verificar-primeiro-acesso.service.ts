import { Injectable } from '@nestjs/common';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';
import { EmailNaoCadastradoException } from '../exceptions/email-nao-cadastrado.exception';

@Injectable()
export class VerificarPrimeiroAcessoService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
  ) {}

  async execute(email: string): Promise<boolean> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (autenticacao == null) {
      throw new EmailNaoCadastradoException();
    }

    return !autenticacao.senha;
  }
}
