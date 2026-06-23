import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { TipoToken } from '../enums/tipo-token.enum';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao-repository.contract';
import { PinRepositoryContract } from '../repositories/pin-repository.contract';
import { PinInvalidoException } from '../exceptions/pin-invalido.exception';

@Injectable()
export class ConfirmarPinService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly pinRepository: PinRepositoryContract,
  ) {}

  async execute(email: string, tipoToken: TipoToken, pin: string): Promise<string> {
    const autenticacao = await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao) {
      throw new PinInvalidoException();
    }

    const pinAtivo = await this.pinRepository.encontrarPinAtivo(
      autenticacao.usuario.id,
      tipoToken,
      pin,
    );

    if (!pinAtivo) {
      throw new PinInvalidoException();
    }

    const token = randomBytes(32).toString('hex');

    await this.pinRepository.definirToken(pinAtivo.id, token);

    return token;
  }
}