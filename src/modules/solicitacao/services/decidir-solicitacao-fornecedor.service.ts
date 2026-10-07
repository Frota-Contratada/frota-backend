import { Injectable } from '@nestjs/common';
import { CancelarNotificacoesDaSolicitacaoService } from '@module/notificacao/services/cancelar-notificacoes-da-solicitacao.service';
import { NotificarSolicitacaoService } from '@module/notificacao/services/notificar-solicitacao.service';
import { CriarCorridaService } from './criar-corrida.service';
import { MotoristaOuVeiculoIndisponivelException } from '../exceptions/motorista-ou-veiculo-indisponivel.exception';
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
    fornecedorId: number,
    decisao: DecisaoFornecedor,
  ): Promise<Solicitacao> {
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
}
