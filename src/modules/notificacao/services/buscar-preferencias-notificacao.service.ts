import { Injectable } from '@nestjs/common';
import { PreferenciasNotificacao } from '../domain/preferencias-notificacao';
import { PreferenciasNotificacaoRepositoryContract } from '../repositories/preferencias-notificacao-repository.contract';

@Injectable()
export class BuscarPreferenciasNotificacaoService {
  constructor(
    private readonly preferenciasRepository: PreferenciasNotificacaoRepositoryContract,
  ) {}

  execute(usuarioId: number): Promise<PreferenciasNotificacao> {
    return this.preferenciasRepository.buscar(usuarioId);
  }
}
