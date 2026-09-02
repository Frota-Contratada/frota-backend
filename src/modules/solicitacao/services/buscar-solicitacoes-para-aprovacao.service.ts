import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { Solicitacao } from '../domain/solicitacao';
import {
  FiltrosBuscarSolicitacoesParaAprovacao,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';

@Injectable()
export class BuscarSolicitacoesParaAprovacaoService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly rotaService: RotaServiceContract,
  ) {}

  async execute(
    filtros: FiltrosBuscarSolicitacoesParaAprovacao,
  ): Promise<PaginatedResponseInterface<Solicitacao>> {
    const resultado =
      await this.solicitacaoRepository.buscarPendentesParaAprovacao(filtros);

    for (const solicitacao of resultado.data) {
      solicitacao.duracaoEstimadaMinutos =
        this.rotaService.estimarDuracaoMinutos(solicitacao.distanciaEstimadaKm);
    }

    return resultado;
  }
}
