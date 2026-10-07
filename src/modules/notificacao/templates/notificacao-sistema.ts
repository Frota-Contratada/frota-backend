import { randomUUID } from 'node:crypto';
import {
  AcaoNotificacao,
  NotificacaoConteudo,
  TipoNotificacao,
} from '../domain/notificacao';

export abstract class NotificacaoSistema<TContexto> {
  abstract readonly tipo: TipoNotificacao;

  abstract preparar(contexto: TContexto): NotificacaoConteudo[];

  protected paraCadaDestinatario(
    destinatarioIds: number[],
    conteudo: {
      titulo: string;
      mensagem: string;
      dados?: Record<string, unknown>;
      acao?: AcaoNotificacao;
    },
  ): NotificacaoConteudo[] {
    return this.normalizarDestinatarios(destinatarioIds).map((usuarioId) => ({
      id: randomUUID(),
      usuarioId,
      tipo: this.tipo,
      ...conteudo,
    }));
  }

  protected normalizarDestinatarios(destinatarioIds: number[]): number[] {
    return [...new Set(destinatarioIds)].filter(
      (id) => Number.isInteger(id) && id > 0,
    );
  }

  protected formatarDataHora(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  }
}
