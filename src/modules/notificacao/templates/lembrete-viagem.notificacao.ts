import { randomUUID } from 'node:crypto';
import { NotificacaoConteudo, TipoNotificacao } from '../domain/notificacao';

export abstract class NotificacaoSistema<TContexto> {
  abstract readonly tipo: TipoNotificacao;

  abstract preparar(contexto: TContexto): NotificacaoConteudo[];
}

export interface ContextoLembreteViagem {
  solicitacaoId: number;
  destinatarioIds: number[];
  dataCorrida: Date;
}

export class LembreteViagemNotificacao extends NotificacaoSistema<ContextoLembreteViagem> {
  readonly tipo = TipoNotificacao.LEMBRETE_VIAGEM;

  preparar(contexto: ContextoLembreteViagem): NotificacaoConteudo[] {
    const destinatarioIds = [...new Set(contexto.destinatarioIds)].filter(
      (id) => Number.isInteger(id) && id > 0,
    );
    const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(contexto.dataCorrida);

    return destinatarioIds.map((usuarioId) => ({
      id: randomUUID(),
      usuarioId,
      tipo: this.tipo,
      titulo: 'Lembrete de viagem',
      mensagem: `Sua viagem está agendada para ${dataFormatada}.`,
      dados: {
        solicitacaoId: contexto.solicitacaoId,
        dataCorrida: contexto.dataCorrida.toISOString(),
      },
      acao: {
        rota: '/solicitacoes',
        parametros: {
          solicitacaoId: String(contexto.solicitacaoId),
        },
      },
    }));
  }
}
