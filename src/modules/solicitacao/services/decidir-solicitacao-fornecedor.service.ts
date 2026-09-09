import { Injectable } from '@nestjs/common';
import { NotificacoesService } from '@module/notificacoes/services/notificacoes.service';
import { Solicitacao } from '../domain/solicitacao';
import {
  DecisaoFornecedor,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';

@Injectable()
export class DecidirSolicitacaoFornecedorService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly notificacoes: NotificacoesService,
  ) {}

  async execute(
    id: number,
    fornecedorId: number,
    decisao: DecisaoFornecedor,
  ): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoRepository.decidirPeloFornecedor(
      id,
      fornecedorId,
      decisao,
    );

    if (decisao.decisao === 'RECUSAR') {
      await this.notificacoes.cancelarDaSolicitacao(solicitacao.id);
      return solicitacao;
    }

    const destinatarioIds = [
      solicitacao.solicitanteId,
      solicitacao.corrida?.motoristaId,
    ].filter((usuarioId): usuarioId is number => usuarioId != null);

    await this.notificacoes.agendarLembreteDaSolicitacao({
      solicitacaoId: solicitacao.id,
      destinatarioIds,
      dataCorrida: solicitacao.dataCorrida.toJSDate(),
    });

    return solicitacao;
  }
}
