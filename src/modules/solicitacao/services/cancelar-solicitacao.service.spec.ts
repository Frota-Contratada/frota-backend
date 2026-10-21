import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { CancelamentoNaoPermitidoException } from '../exceptions/cancelamento-nao-permitido.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { SolicitacaoNaoCancelavelException } from '../exceptions/solicitacao-nao-cancelavel.exception';
import { CancelarSolicitacaoService } from './cancelar-solicitacao.service';

describe('CancelarSolicitacaoService', () => {
  const criarService = (
    cancelavel = true,
    tipoMotivo = TipoMotivo.CANCELAMENTO,
  ) => {
    const solicitacao = {
      solicitanteId: 1002,
      cancelavel,
      centrosCusto: [{ aprovadorId: 1003, empresaId: 30, filialId: 704 }],
    };
    const solicitacaoRepository = {
      buscar: jest.fn().mockResolvedValue(solicitacao),
      cancelar: jest.fn().mockResolvedValue(solicitacao),
    };
    const catalogoRepository = {
      buscarMotivo: jest
        .fn()
        .mockResolvedValue({ tipo: tipoMotivo, nome: 'Reunião cancelada' }),
    };
    const notificarSolicitacao = { solicitacaoCancelada: jest.fn() };
    const service = new CancelarSolicitacaoService(
      solicitacaoRepository as never,
      catalogoRepository as never,
      { execute: jest.fn() } as never,
      notificarSolicitacao as never,
    );

    return { service, solicitacaoRepository, notificarSolicitacao };
  };

  it.each([
    ['o solicitante dono', { id: 1002, perfis: [TipoPerfil.SOLICITANTE] }],
    ['o aprovador do rateio', { id: 1003, perfis: [TipoPerfil.APROVADOR] }],
    [
      'o administrador da filial do rateio',
      {
        id: 2,
        perfis: [TipoPerfil.ADMIN_FILIAL],
        empresaId: 30,
        filialId: 704,
      },
    ],
    ['o administrador master', { id: 1, perfis: [TipoPerfil.ADMIN_MASTER] }],
  ])('permite que %s cancele', async (_descricao, usuario) => {
    const { service, solicitacaoRepository, notificarSolicitacao } =
      criarService();

    await service.execute(8, 9002, usuario);

    expect(solicitacaoRepository.cancelar).toHaveBeenCalledWith(8, 9002);
    expect(notificarSolicitacao.solicitacaoCancelada).toHaveBeenCalledWith(8, {
      canceladaPorId: usuario.id,
      motivo: 'Reunião cancelada',
    });
  });

  it.each([
    ['outro solicitante', { id: 5000, perfis: [TipoPerfil.SOLICITANTE] }],
    ['aprovador de outro rateio', { id: 5000, perfis: [TipoPerfil.APROVADOR] }],
    [
      'administrador de outra filial',
      { id: 2, perfis: [TipoPerfil.ADMIN_FILIAL], empresaId: 30, filialId: 1 },
    ],
  ])('impede que %s cancele', async (_descricao, usuario) => {
    const { service, solicitacaoRepository } = criarService();

    await expect(service.execute(8, 9002, usuario)).rejects.toBeInstanceOf(
      CancelamentoNaoPermitidoException,
    );
    expect(solicitacaoRepository.cancelar).not.toHaveBeenCalled();
  });

  it('recusa motivo que não é de cancelamento', async () => {
    const { service, solicitacaoRepository } = criarService(
      true,
      TipoMotivo.SOLICITACAO,
    );

    await expect(
      service.execute(8, 1, { id: 1002, perfis: [TipoPerfil.SOLICITANTE] }),
    ).rejects.toBeInstanceOf(MotivoNaoEncontradoException);
    expect(solicitacaoRepository.cancelar).not.toHaveBeenCalled();
  });

  it('recusa solicitação que não pode mais ser cancelada', async () => {
    const { service } = criarService(false);

    await expect(
      service.execute(8, 9002, { id: 1002, perfis: [TipoPerfil.SOLICITANTE] }),
    ).rejects.toBeInstanceOf(SolicitacaoNaoCancelavelException);
  });
});
