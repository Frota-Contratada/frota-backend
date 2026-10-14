import {
  AlteracaoPreferenciasNotificacao,
  PreferenciasNotificacao,
} from '../domain/preferencias-notificacao';

export abstract class PreferenciasNotificacaoRepositoryContract {
  abstract buscar(usuarioId: number): Promise<PreferenciasNotificacao>;

  abstract buscarPorUsuarios(
    usuarioIds: number[],
  ): Promise<Map<number, PreferenciasNotificacao>>;

  abstract atualizar(
    usuarioId: number,
    alteracao: AlteracaoPreferenciasNotificacao,
  ): Promise<PreferenciasNotificacao>;
}
