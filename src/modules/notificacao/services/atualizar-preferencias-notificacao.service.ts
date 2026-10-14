import { Injectable } from '@nestjs/common';
import {
  AlteracaoPreferenciasNotificacao,
  PreferenciasNotificacao,
} from '../domain/preferencias-notificacao';
import { PreferenciasNotificacaoRepositoryContract } from '../repositories/preferencias-notificacao-repository.contract';

@Injectable()
export class AtualizarPreferenciasNotificacaoService {
  constructor(
    private readonly preferenciasRepository: PreferenciasNotificacaoRepositoryContract,
  ) {}

  execute(
    usuarioId: number,
    alteracao: AlteracaoPreferenciasNotificacao,
  ): Promise<PreferenciasNotificacao> {
    return this.preferenciasRepository.atualizar(usuarioId, alteracao);
  }
}
