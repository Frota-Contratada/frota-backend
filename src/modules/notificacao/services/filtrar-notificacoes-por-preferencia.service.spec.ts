import { NotificacaoConteudo, TipoNotificacao } from '../domain/notificacao';
import {
  CategoriaNotificacao,
  PreferenciasNotificacao,
  TIPOS_POR_CATEGORIA,
  preferenciasPadrao,
} from '../domain/preferencias-notificacao';
import { FiltrarNotificacoesPorPreferenciaService } from './filtrar-notificacoes-por-preferencia.service';

function notificacao(
  usuarioId: number,
  tipo: TipoNotificacao,
): NotificacaoConteudo {
  return {
    id: `${usuarioId}-${tipo}`,
    usuarioId,
    tipo,
    titulo: 'Título',
    mensagem: 'Mensagem',
  };
}

function comCategoriaDesligada(
  categoria: CategoriaNotificacao,
): PreferenciasNotificacao {
  const preferencias = preferenciasPadrao();
  preferencias.categorias[categoria] = false;
  return preferencias;
}

describe('TIPOS_POR_CATEGORIA', () => {
  it('coloca cada tipo de notificação em exatamente uma categoria', () => {
    const tipos = Object.values(TIPOS_POR_CATEGORIA).flat();

    expect(new Set(tipos).size).toBe(tipos.length);
    expect(new Set(tipos)).toEqual(new Set(Object.values(TipoNotificacao)));
  });
});

describe('FiltrarNotificacoesPorPreferenciaService', () => {
  const buscarPorUsuarios = jest.fn();
  const service = new FiltrarNotificacoesPorPreferenciaService({
    buscarPorUsuarios,
  } as never);

  beforeEach(() => buscarPorUsuarios.mockReset());

  it('remove apenas as notificações das categorias desligadas de cada usuário', async () => {
    buscarPorUsuarios.mockResolvedValue(
      new Map([
        [1, comCategoriaDesligada(CategoriaNotificacao.SOLICITACAO_ENCERRADA)],
      ]),
    );

    const resultado = await service.execute([
      notificacao(1, TipoNotificacao.SOLICITACAO_CANCELADA),
      notificacao(1, TipoNotificacao.CORRIDA_CANCELADA),
      notificacao(2, TipoNotificacao.SOLICITACAO_CANCELADA),
    ]);

    expect(buscarPorUsuarios).toHaveBeenCalledWith([1, 2]);
    expect(resultado.map((n) => n.id)).toEqual([
      `1-${TipoNotificacao.CORRIDA_CANCELADA}`,
      `2-${TipoNotificacao.SOLICITACAO_CANCELADA}`,
    ]);
  });

  it('entrega tudo quando as preferências não podem ser lidas', async () => {
    buscarPorUsuarios.mockRejectedValue(new Error('banco fora'));
    const notificacoes = [notificacao(1, TipoNotificacao.LEMBRETE_VIAGEM)];

    await expect(service.execute(notificacoes)).resolves.toEqual(notificacoes);
  });

  it('não consulta o banco quando não há notificações', async () => {
    await expect(service.execute([])).resolves.toEqual([]);
    expect(buscarPorUsuarios).not.toHaveBeenCalled();
  });
});
