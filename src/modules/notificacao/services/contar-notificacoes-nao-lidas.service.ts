import { Injectable } from '@nestjs/common';
import { NotificacaoRepositoryContract } from '../repositories/notificacao-repository.contract';

@Injectable()
export class ContarNotificacoesNaoLidasService {
  constructor(
    private readonly notificacaoRepository: NotificacaoRepositoryContract,
  ) {}

  execute(usuarioId: number): Promise<number> {
    return this.notificacaoRepository.contarNaoLidas(usuarioId);
  }
}
