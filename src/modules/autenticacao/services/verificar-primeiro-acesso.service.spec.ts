import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';
import { EmailNaoCadastradoException } from '../exceptions/email-nao-cadastrado.exception';
import { VerificarPrimeiroAcessoService } from './verificar-primeiro-acesso.service';

describe('VerificarPrimeiroAcessoService', () => {
  const buscarPorEmail = jest.fn();
  const service = new VerificarPrimeiroAcessoService({
    buscarPorEmail,
  } as unknown as AutenticacaoRepositoryContract);

  beforeEach(() => buscarPorEmail.mockReset());

  it('rejeita e-mail sem conta cadastrada', async () => {
    buscarPorEmail.mockResolvedValue(null);

    await expect(service.execute('nao@existe.com')).rejects.toBeInstanceOf(
      EmailNaoCadastradoException,
    );
  });

  it('indica primeiro acesso quando o usuário ainda não tem senha', async () => {
    buscarPorEmail.mockResolvedValue({ senha: null });

    await expect(service.execute('novo@empresa.com')).resolves.toBe(true);
  });

  it('não indica primeiro acesso quando o usuário já tem senha', async () => {
    buscarPorEmail.mockResolvedValue({ senha: 'hash' });

    await expect(service.execute('antigo@empresa.com')).resolves.toBe(false);
  });
});
