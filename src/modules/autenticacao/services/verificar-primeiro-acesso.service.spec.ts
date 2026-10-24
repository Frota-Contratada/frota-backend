import { EmailNaoCadastradoException } from '../exceptions/email-nao-cadastrado.exception';
import { VerificarPrimeiroAcessoService } from './verificar-primeiro-acesso.service';

describe('VerificarPrimeiroAcessoService', () => {
  const criarService = (autenticacao: unknown) =>
    new VerificarPrimeiroAcessoService({
      buscarPorEmail: jest.fn().mockResolvedValue(autenticacao),
    } as never);

  it('indica primeiro acesso para usuário cadastrado sem senha', async () => {
    await expect(
      criarService({ senha: undefined }).execute('novo@frota.com.br'),
    ).resolves.toBe(true);
  });

  it('não indica primeiro acesso para usuário com senha', async () => {
    await expect(
      criarService({ senha: 'hash' }).execute('ativo@frota.com.br'),
    ).resolves.toBe(false);
  });

  it('rejeita e-mail inexistente sem encaminhar para senha', async () => {
    await expect(
      criarService(null).execute('inexistente@frota.com.br'),
    ).rejects.toBeInstanceOf(EmailNaoCadastradoException);
  });
});
