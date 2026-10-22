import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { DecidirSolicitacaoFornecedorService } from './decidir-solicitacao-fornecedor.service';

describe('DecidirSolicitacaoFornecedorService', () => {
  const alocacao = {
    decisao: 'REATRIBUIR' as const,
    motoristaId: 8,
    veiculoId: 9001,
  };

  const criarService = (
    solicitacao: unknown = { id: 77, fornecedorId: 864 },
  ) => {
    const solicitacaoRepository = {
      buscar: jest.fn().mockResolvedValue(solicitacao),
      decidirPeloFornecedor: jest.fn(),
    };
    const criarCorrida = {
      execute: jest.fn().mockResolvedValue({ id: 77 }),
    };
    const notificarSolicitacao = {
      solicitacaoVirouCorrida: jest.fn(),
      agendarLembretesDaCorrida: jest.fn(),
    };
    const service = new DecidirSolicitacaoFornecedorService(
      solicitacaoRepository as never,
      criarCorrida as never,
      notificarSolicitacao as never,
      { execute: jest.fn() } as never,
    );

    return { service, solicitacaoRepository, criarCorrida };
  };

  it('aloca pelo fornecedor do admin de fornecedor', async () => {
    const { service, solicitacaoRepository, criarCorrida } = criarService();

    await service.execute(
      77,
      { fornecedorId: 6796, perfis: [TipoPerfil.ADMIN_FORNECEDOR] },
      alocacao,
    );

    expect(solicitacaoRepository.buscar).not.toHaveBeenCalled();
    expect(criarCorrida.execute).toHaveBeenCalledWith(
      expect.objectContaining({ solicitacaoId: 77, fornecedorId: 6796 }),
    );
  });

  it('aloca em nome do fornecedor da solicitação quando é o admin master', async () => {
    const { service, criarCorrida } = criarService();

    await service.execute(77, { perfis: [TipoPerfil.ADMIN_MASTER] }, alocacao);

    expect(criarCorrida.execute).toHaveBeenCalledWith(
      expect.objectContaining({ solicitacaoId: 77, fornecedorId: 864 }),
    );
  });

  it('recusa quem não tem fornecedor e não é admin master', async () => {
    const { service, criarCorrida } = criarService();

    await expect(
      service.execute(77, { perfis: [TipoPerfil.APROVADOR] }, alocacao),
    ).rejects.toBeInstanceOf(VinculoDoUsuarioAusenteException);
    expect(criarCorrida.execute).not.toHaveBeenCalled();
  });

  it('informa solicitação inexistente ao admin master', async () => {
    const { service } = criarService(null);

    await expect(
      service.execute(77, { perfis: [TipoPerfil.ADMIN_MASTER] }, alocacao),
    ).rejects.toBeInstanceOf(SolicitacaoNaoEncontradaException);
  });
});
