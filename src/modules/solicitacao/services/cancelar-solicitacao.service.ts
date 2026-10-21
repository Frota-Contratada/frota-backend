import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CancelarNotificacoesDaSolicitacaoService } from '@module/notificacao/services/cancelar-notificacoes-da-solicitacao.service';
import { NotificarSolicitacaoService } from '@module/notificacao/services/notificar-solicitacao.service';
import { Solicitacao } from '../domain/solicitacao';
import { CancelamentoNaoPermitidoException } from '../exceptions/cancelamento-nao-permitido.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { SolicitacaoNaoCancelavelException } from '../exceptions/solicitacao-nao-cancelavel.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';

@Injectable()
export class CancelarSolicitacaoService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
    private readonly cancelarNotificacoesDaSolicitacao: CancelarNotificacoesDaSolicitacaoService,
    private readonly notificarSolicitacao: NotificarSolicitacaoService,
  ) {}

  async execute(
    id: number,
    motivoCancelamentoId: number,
    usuario: AuthenticatedUser,
  ): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoRepository.buscar(id);

    if (!solicitacao) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    if (!this.podeCancelar(solicitacao, usuario)) {
      throw new CancelamentoNaoPermitidoException(id);
    }

    if (!solicitacao.cancelavel) {
      throw new SolicitacaoNaoCancelavelException(id);
    }

    const motivo =
      await this.catalogoRepository.buscarMotivo(motivoCancelamentoId);

    if (!motivo) {
      throw new MotivoNaoEncontradoException(motivoCancelamentoId);
    }

    const cancelada = await this.solicitacaoRepository.cancelar(
      id,
      motivoCancelamentoId,
    );
    await this.cancelarNotificacoesDaSolicitacao.execute(id);
    await this.notificarSolicitacao.solicitacaoCancelada(id, {
      canceladaPorId: usuario.id,
      motivo: motivo.nome,
    });

    return cancelada;
  }

  private podeCancelar(
    solicitacao: Solicitacao,
    usuario: AuthenticatedUser,
  ): boolean {
    if (usuario.perfis.includes(TipoPerfil.ADMIN_MASTER)) return true;

    if (solicitacao.solicitanteId === usuario.id) return true;

    if (
      usuario.perfis.includes(TipoPerfil.APROVADOR) &&
      solicitacao.centrosCusto.some(
        (rateio) => rateio.aprovadorId === usuario.id,
      )
    ) {
      return true;
    }

    return (
      usuario.perfis.includes(TipoPerfil.ADMIN_FILIAL) &&
      solicitacao.centrosCusto.some(
        (rateio) =>
          rateio.empresaId === usuario.empresaId &&
          rateio.filialId === usuario.filialId,
      )
    );
  }
}
