import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { EmailServiceContract } from '@core/email/contracts/email-service.contract';
import { TipoToken } from '../enums/tipo-token.enum';
import { PinRepositoryContract } from '../repositories/pin/pin-repository.contract';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';
import {
  EMAIL_TEMPLATES_AUTENTICACAO,
  EmailTemplateAutenticacaoCampos,
} from '../templates/email-template-autenticacao.config';

@Injectable()
export class EnviarPinEmailService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly pinRepository: PinRepositoryContract,
    private readonly emailService: EmailServiceContract,
  ) {}

  async execute(email: string, tipoToken: TipoToken): Promise<void> {
    const autenticacao =
      await this.autenticacaoRepository.buscarPorEmail(email);

    if (!autenticacao) {
      return;
    }

    if (autenticacao.senha && tipoToken === TipoToken.SIGN_UP) {
      return;
    }

    await this.pinRepository.invalidarAnteriores(
      autenticacao.usuario.id,
      tipoToken,
    );

    const pinGerado = randomInt(0, 1_000_000).toString().padStart(6, '0');

    const pin = await this.pinRepository.criar(
      autenticacao.usuario.id,
      tipoToken,
      pinGerado,
    );

    const tempoValidadeEmMinutos = Math.round(
      (pin.dataExpiracao.getTime() - pin.dataCriacao.getTime()) / 60_000,
    );

    const campos = {
      nome: autenticacao.usuario.nome,
      codigo: pinGerado,
      tempo: tempoValidadeEmMinutos.toString(),
    };

    switch (tipoToken) {
      case TipoToken.SIGN_UP:
        await this.enviarEmail(tipoToken, email, campos);
        break;
      case TipoToken.REDEFINIR_SENHA:
        await this.enviarEmail(tipoToken, email, campos);
        break;
    }
  }

  private async enviarEmail<TTipoToken extends TipoToken>(
    tipoToken: TTipoToken,
    destinatario: string,
    campos: EmailTemplateAutenticacaoCampos[TTipoToken],
  ): Promise<void> {
    const { caminhoArquivo, assunto } = EMAIL_TEMPLATES_AUTENTICACAO[tipoToken];

    await this.emailService.enviarEmail({
      email: destinatario,
      assunto,
      template: { caminhoArquivo, campos },
    });
  }
}
