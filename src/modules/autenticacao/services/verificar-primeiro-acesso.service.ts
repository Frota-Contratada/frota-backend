import { Injectable } from '@nestjs/common';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';

@Injectable()
export class VerificarPrimeiroAcessoService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
  ) {}

  async execute(email: string): Promise<boolean> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (autenticacao?.senha) {
      return false;
    }

    return true;
  }
}
