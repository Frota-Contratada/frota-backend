import { Injectable, Logger } from '@nestjs/common';
import { NotificacaoConteudo } from '../domain/notificacao';
import { permiteTipo } from '../domain/preferencias-notificacao';
import { PreferenciasNotificacaoRepositoryContract } from '../repositories/preferencias-notificacao-repository.contract';

@Injectable()
export class FiltrarNotificacoesPorPreferenciaService {
  private readonly logger = new Logger(
    FiltrarNotificacoesPorPreferenciaService.name,
  );

  constructor(
    private readonly preferenciasRepository: PreferenciasNotificacaoRepositoryContract,
  ) {}

  async execute<T extends NotificacaoConteudo>(
    notificacoes: T[],
  ): Promise<T[]> {
    if (notificacoes.length === 0) return notificacoes;

    try {
      const usuarioIds = [...new Set(notificacoes.map((n) => n.usuarioId))];
      const preferencias =
        await this.preferenciasRepository.buscarPorUsuarios(usuarioIds);

      return notificacoes.filter((notificacao) => {
        const doUsuario = preferencias.get(notificacao.usuarioId);
        return !doUsuario || permiteTipo(doUsuario, notificacao.tipo);
      });
    } catch (error) {
      this.logger.warn(
        `Preferências indisponíveis; entregando sem filtro. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return notificacoes;
    }
  }
}
