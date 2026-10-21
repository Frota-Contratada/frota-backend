import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { FornecedorDeOutraFilialException } from '@module/fornecedor/exceptions/fornecedor-de-outra-filial.exception';
import { AcessoAoFornecedorNegadoException } from '../exceptions/acesso-ao-fornecedor-negado.exception';
import { ResolverEscopoVeiculoService } from './resolver-escopo-veiculo.service';

describe('ResolverEscopoVeiculoService', () => {
  const criarService = (pertence = true) =>
    new ResolverEscopoVeiculoService({
      pertenceAFilial: jest.fn().mockResolvedValue(pertence),
    } as never);

  const adminFilial = {
    id: 2,
    perfis: [TipoPerfil.ADMIN_FILIAL],
    empresaId: 30,
    filialId: 704,
  };
  const adminFornecedor = {
    id: 3,
    perfis: [TipoPerfil.ADMIN_FORNECEDOR],
    fornecedorId: 864,
  };

  it('restringe o admin de fornecedor à própria frota', async () => {
    await expect(criarService().execute(adminFornecedor)).resolves.toEqual({
      fornecedorId: 864,
    });
  });

  it('impede o admin de fornecedor de ver outra frota', async () => {
    await expect(
      criarService().execute(adminFornecedor, 6796),
    ).rejects.toBeInstanceOf(AcessoAoFornecedorNegadoException);
  });

  it('limita o admin de filial aos fornecedores vinculados', async () => {
    await expect(criarService().execute(adminFilial)).resolves.toEqual({
      filial: { empresaId: 30, filialId: 704 },
    });
    await expect(criarService(true).execute(adminFilial, 864)).resolves.toEqual(
      { fornecedorId: 864 },
    );
    await expect(
      criarService(false).execute(adminFilial, 6796),
    ).rejects.toBeInstanceOf(FornecedorDeOutraFilialException);
  });

  it('libera qualquer frota ao admin master', async () => {
    await expect(
      criarService().execute({ id: 1, perfis: [TipoPerfil.ADMIN_MASTER] }, 7),
    ).resolves.toEqual({ fornecedorId: 7 });
  });
});
