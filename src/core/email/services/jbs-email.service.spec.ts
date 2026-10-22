import * as nodemailer from 'nodemailer';
import { JbsEmailService } from './jbs-email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({}),
}));

describe('JbsEmailService', () => {
  const criarService = (variaveis: Record<string, string | undefined>) =>
    new JbsEmailService(
      { get: jest.fn((chave: string) => variaveis[chave]) } as never,
      {} as never,
    );

  beforeEach(() => {
    jest.mocked(nodemailer.createTransport).mockClear();
  });

  it('usa TLS direto e autenticação quando configurados', () => {
    criarService({
      SMTP_HOST: 'smtp.exemplo.com',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'conta@exemplo.com',
      SMTP_PASSWORD: 'senha',
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.exemplo.com',
      port: 465,
      secure: true,
      auth: { user: 'conta@exemplo.com', pass: 'senha' },
    });
  });

  it('não envia credenciais para servidor sem autenticação', () => {
    criarService({ SMTP_HOST: 'relay.interno', SMTP_PORT: '25' });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'relay.interno',
      port: 25,
      secure: false,
    });
  });
});
