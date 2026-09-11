import { Injectable } from '@nestjs/common';
import { Notificacao } from '../domain/notificacao';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';

@Injectable()
export class MarcarNotificacaoComoLidaService {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
  ) {}

  execute(
    usuarioId: number,
    notificacaoId: string,
  ): Promise<Notificacao | null> {
    return this.notificacaoRepository.marcarComoLida(usuarioId, notificacaoId);
  }
}
