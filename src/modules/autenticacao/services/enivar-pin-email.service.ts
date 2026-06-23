import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { TipoToken } from '../enums/tipo-token.enum';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao-repository.contract';
import { PinRepositoryContract } from '../repositories/pin-repository.contract';

@Injectable()
export class EnviarPinEmailService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly pinRepository: PinRepositoryContract,
  ) {}

  async execute(email: string, tipoToken: TipoToken): Promise<void> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao) {
      return;
    }

    if (autenticacao.senha && tipoToken.toString() == 'SIGN_UP') {
      return;
    }

    await this.pinRepository.invalidarAnteriores(
      autenticacao.usuario.id,
      tipoToken,
    );

    const pinGerado = randomInt(0, 1_000_000).toString().padStart(6, '0');

    await this.pinRepository.criar(
      autenticacao.usuario.id,
      tipoToken,
      pinGerado,
    );

    console.log(
      autenticacao.usuario.email,
      autenticacao.usuario.nome,
      pinGerado,
      tipoToken,
    );
  }
}
