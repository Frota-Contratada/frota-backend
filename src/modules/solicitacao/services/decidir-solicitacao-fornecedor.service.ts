import { Injectable } from '@nestjs/common';
import { Solicitacao } from '../domain/solicitacao';
import {
  DecisaoFornecedor,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';

@Injectable()
export class DecidirSolicitacaoFornecedorService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
  ) {}

  execute(
    id: number,
    fornecedorId: number,
    decisao: DecisaoFornecedor,
  ): Promise<Solicitacao> {
    return this.solicitacaoRepository.decidirPeloFornecedor(
      id,
      fornecedorId,
      decisao,
    );
  }
}
