import { Injectable } from '@nestjs/common';
import { Notificacao } from '../domain/notificacao';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';

@Injectable()
export class ListarNotificacoesService {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
  ) {}

  execute(usuarioId: number): Promise<Notificacao[]> {
    return this.notificacaoRepository.listarPorUsuario(usuarioId, 50);
  }
}
