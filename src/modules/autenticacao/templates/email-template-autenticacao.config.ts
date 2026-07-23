import { join } from 'path';
import { TipoToken } from '../enums/tipo-token.enum';

export interface EmailTemplateCamposSignUpInterface extends Record<string, string> {
  nome: string;
  codigo: string;
  tempo: string;
}

export interface EmailTemplateCamposRedefinirSenhaInterface
  extends Record<string, string> {
  nome: string;
  codigo: string;
  tempo: string;
}

export type EmailTemplateAutenticacaoCampos = {
  [TipoToken.SIGN_UP]: EmailTemplateCamposSignUpInterface;
  [TipoToken.REDEFINIR_SENHA]: EmailTemplateCamposRedefinirSenhaInterface;
};

interface EmailTemplateAutenticacaoDefinicaoInterface {
  caminhoArquivo: string;
  assunto: string;
}

export const EMAIL_TEMPLATES_AUTENTICACAO: Record<
  TipoToken,
  EmailTemplateAutenticacaoDefinicaoInterface
> = {
  [TipoToken.SIGN_UP]: {
    caminhoArquivo: join(__dirname, 'sign-up-email.html'),
    assunto: 'Primeiro acesso',
  },
  [TipoToken.REDEFINIR_SENHA]: {
    caminhoArquivo: join(__dirname, 'redefinir-senha.html'),
    assunto: 'Redefinição de senha',
  },
};