import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Notificacao } from '../domain/notificacao';

@Injectable()
export class NotificacoesEventsService {
  private server?: Server;

  attach(server: Server): void {
    this.server = server;
  }

  publicarCriada(notificacao: Notificacao): void {
    this.server
      ?.to(this.salaDoUsuario(notificacao.usuarioId))
      .emit('notificacao.criada', {
        schemaVersion: 1,
        notificacao,
      });
  }

  publicarRemovida(usuarioId: number, notificacaoId: string): void {
    this.server
      ?.to(this.salaDoUsuario(usuarioId))
      .emit('notificacao.removida', {
        schemaVersion: 1,
        notificacaoId,
      });
  }

  private salaDoUsuario(usuarioId: number): string {
    return `usuario:${usuarioId}`;
  }
}
