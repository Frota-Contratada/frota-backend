import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { Solicitacao } from '../domain/solicitacao';
import {
  FiltrosBuscarSolicitacoes,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';

@Injectable()
export class BuscarVariasSolicitacoesService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly rotaService: RotaServiceContract,
  ) {}

  async execute(
    filtros: FiltrosBuscarSolicitacoes,
  ): Promise<PaginatedResponseInterface<Solicitacao>> {
    const resultado = await this.solicitacaoRepository.buscarVarias(filtros);

    for (const solicitacao of resultado.data) {
      solicitacao.duracaoEstimadaMinutos =
        this.rotaService.estimarDuracaoMinutos(solicitacao.distanciaEstimadaKm);
    }

    return resultado;
  }
}
