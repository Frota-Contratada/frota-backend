import { Injectable } from '@nestjs/common';
import { NotificacoesService } from '@module/notificacoes/services/notificacoes.service';
import { Solicitacao } from '../domain/solicitacao';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { SolicitacaoDeOutroSolicitanteException } from '../exceptions/solicitacao-de-outro-solicitante.exception';
import { SolicitacaoNaoCancelavelException } from '../exceptions/solicitacao-nao-cancelavel.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';

@Injectable()
export class CancelarSolicitacaoService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
    private readonly notificacoes: NotificacoesService,
  ) {}

  async execute(
    id: number,
    motivoCancelamentoId: number,
    solicitanteId?: number,
  ): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoRepository.buscar(id);

    if (!solicitacao) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    if (solicitanteId != null && solicitacao.solicitanteId !== solicitanteId) {
      throw new SolicitacaoDeOutroSolicitanteException(id);
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
    await this.notificacoes.cancelarDaSolicitacao(id);

    return cancelada;
  }
}
