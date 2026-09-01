import { Injectable } from '@nestjs/common';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { Solicitacao } from '../domain/solicitacao';
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';
import { SolicitacaoDeOutroSolicitanteException } from '../exceptions/solicitacao-de-outro-solicitante.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';

@Injectable()
export class BuscarSolicitacaoService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly rotaService: RotaServiceContract,
  ) {}

  async execute(id: number, solicitanteId?: number): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoRepository.buscar(id);

    if (!solicitacao) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    if (solicitanteId != null && solicitacao.solicitanteId !== solicitanteId) {
      throw new SolicitacaoDeOutroSolicitanteException(id);
    }

    solicitacao.duracaoEstimadaMinutos = this.rotaService.estimarDuracaoMinutos(
      solicitacao.distanciaEstimadaKm,
    );

    return solicitacao;
  }
}
