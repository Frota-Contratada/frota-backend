import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { RotaServiceContract } from '@core/rota/contracts/rota-service.contract';
import { Solicitacao } from '../domain/solicitacao';
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';

@Injectable()
export class BuscarViagensAgendadasService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly rotaService: RotaServiceContract,
  ) {}

  async execute(
    solicitanteId: number,
    inicio: DateTime,
    fim: DateTime,
  ): Promise<Solicitacao[]> {
    const viagens = await this.solicitacaoRepository.buscarAgendadasPorPeriodo({
      solicitanteId,
      inicio,
      fim,
    });

    for (const viagem of viagens) {
      viagem.duracaoEstimadaMinutos = this.rotaService.estimarDuracaoMinutos(
        viagem.distanciaEstimadaKm,
      );
    }

    return viagens;
  }
}
