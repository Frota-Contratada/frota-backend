import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { CancelarNotificacoesDaSolicitacaoService } from '@module/notificacao/services/cancelar-notificacoes-da-solicitacao.service';
import { NotificarSolicitacaoService } from '@module/notificacao/services/notificar-solicitacao.service';
import { CriarCorridaService } from './criar-corrida.service';
import { MotoristaOuVeiculoIndisponivelException } from '../exceptions/motorista-ou-veiculo-indisponivel.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { Solicitacao } from '../domain/solicitacao';
import {
  DecisaoFornecedor,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';

@Injectable()
export class DecidirSolicitacaoFornecedorService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly criarCorrida: CriarCorridaService,
    private readonly notificarSolicitacao: NotificarSolicitacaoService,
    private readonly cancelarNotificacoesDaSolicitacao: CancelarNotificacoesDaSolicitacaoService,
  ) {}

  async execute(
    id: number,
    usuario: Pick<AuthenticatedUser, 'fornecedorId' | 'perfis'>,
    decisao: DecisaoFornecedor,
  ): Promise<Solicitacao> {
    const fornecedorId = await this.resolverFornecedor(id, usuario);

    if (decisao.decisao === 'RECUSAR') {
      const solicitacao =
        await this.solicitacaoRepository.decidirPeloFornecedor(
          id,
          fornecedorId,
          decisao,
        );

      await this.cancelarNotificacoesDaSolicitacao.execute(solicitacao.id);
      await this.notificarSolicitacao.solicitacaoRecusadaPeloFornecedor(
        solicitacao.id,
        decisao.motivo,
      );

      return solicitacao;
    }

    if (decisao.motoristaId == null || decisao.veiculoId == null) {
      throw new MotoristaOuVeiculoIndisponivelException();
    }

    const solicitacao = await this.criarCorrida.execute({
      solicitacaoId: id,
      fornecedorId,
      motoristaId: decisao.motoristaId,
      veiculoId: decisao.veiculoId,
    });

    await this.notificarSolicitacao.solicitacaoVirouCorrida(solicitacao.id);
    await this.notificarSolicitacao.agendarLembretesDaCorrida(solicitacao.id);

    return solicitacao;
  }

  private async resolverFornecedor(
    id: number,
    usuario: Pick<AuthenticatedUser, 'fornecedorId' | 'perfis'>,
  ): Promise<number> {
    if (usuario.fornecedorId != null) return usuario.fornecedorId;

    if (!usuario.perfis.includes(TipoPerfil.ADMIN_MASTER)) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FORNECEDOR);
    }

    const solicitacao = await this.solicitacaoRepository.buscar(id);

    if (solicitacao == null) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    return solicitacao.fornecedorId;
  }
}
