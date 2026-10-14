import { Injectable } from '@nestjs/common';
import { NotificarSolicitacaoService } from '@module/notificacao/services/notificar-solicitacao.service';
import { MotoristaCorrida } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from '../repositories/motorista-corrida-repository.contract';

@Injectable()
export class RecusarCorridaService {
  constructor(
    private readonly repository: MotoristaCorridaRepositoryContract,
    private readonly notificarSolicitacao: NotificarSolicitacaoService,
  ) {}

  async execute(
    corridaId: number,
    motoristaId: number,
    motivo: string,
  ): Promise<MotoristaCorrida> {
    const corrida = await this.repository.recusar(
      corridaId,
      motoristaId,
      motivo,
    );

    await this.notificarSolicitacao.corridaRecusadaPeloMotorista(
      corrida.solicitacaoId,
      { motoristaId, motivo },
    );

    return corrida;
  }
}
