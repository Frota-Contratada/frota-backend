import { TipoNotificacao } from './notificacao';

export enum CategoriaNotificacao {
  LEMBRETE_VIAGEM = 'LEMBRETE_VIAGEM',
  CORRIDA_CONFIRMADA = 'CORRIDA_CONFIRMADA',
  SOLICITACAO_ENCERRADA = 'SOLICITACAO_ENCERRADA',
  CORRIDA_CANCELADA = 'CORRIDA_CANCELADA',
  APROVACAO_PENDENTE = 'APROVACAO_PENDENTE',
  DECISAO_FORNECEDOR = 'DECISAO_FORNECEDOR',
}

export const TIPOS_POR_CATEGORIA: Record<
  CategoriaNotificacao,
  TipoNotificacao[]
> = {
  [CategoriaNotificacao.LEMBRETE_VIAGEM]: [TipoNotificacao.LEMBRETE_VIAGEM],
  [CategoriaNotificacao.CORRIDA_CONFIRMADA]: [
    TipoNotificacao.SOLICITACAO_VIROU_CORRIDA,
  ],
  [CategoriaNotificacao.SOLICITACAO_ENCERRADA]: [
    TipoNotificacao.SOLICITACAO_REPROVADA,
    TipoNotificacao.SOLICITACAO_RECUSADA_FORNECEDOR,
    TipoNotificacao.SOLICITACAO_CANCELADA,
  ],
  [CategoriaNotificacao.CORRIDA_CANCELADA]: [TipoNotificacao.CORRIDA_CANCELADA],
  [CategoriaNotificacao.APROVACAO_PENDENTE]: [
    TipoNotificacao.SOLICITACAO_CRIADA,
  ],
  [CategoriaNotificacao.DECISAO_FORNECEDOR]: [
    TipoNotificacao.SOLICITACAO_AGUARDANDO_FORNECEDOR,
  ],
};

const CATEGORIA_POR_TIPO = new Map<TipoNotificacao, CategoriaNotificacao>(
  Object.entries(TIPOS_POR_CATEGORIA).flatMap(([categoria, tipos]) =>
    tipos.map((tipo) => [tipo, categoria as CategoriaNotificacao] as const),
  ),
);

export function categoriaDoTipo(
  tipo: TipoNotificacao,
): CategoriaNotificacao | undefined {
  return CATEGORIA_POR_TIPO.get(tipo);
}

export interface PreferenciasNotificacao {
  pushAtivo: boolean;
  categorias: Record<CategoriaNotificacao, boolean>;
  atualizadoEm: Date | null;
}

export interface AlteracaoPreferenciasNotificacao {
  pushAtivo?: boolean;
  categorias?: Partial<Record<CategoriaNotificacao, boolean>>;
}

export function preferenciasPadrao(): PreferenciasNotificacao {
  return {
    pushAtivo: true,
    categorias: {
      [CategoriaNotificacao.LEMBRETE_VIAGEM]: true,
      [CategoriaNotificacao.CORRIDA_CONFIRMADA]: true,
      [CategoriaNotificacao.SOLICITACAO_ENCERRADA]: true,
      [CategoriaNotificacao.CORRIDA_CANCELADA]: true,
      [CategoriaNotificacao.APROVACAO_PENDENTE]: true,
      [CategoriaNotificacao.DECISAO_FORNECEDOR]: true,
    },
    atualizadoEm: null,
  };
}

export function permiteTipo(
  preferencias: PreferenciasNotificacao,
  tipo: TipoNotificacao,
): boolean {
  const categoria = categoriaDoTipo(tipo);
  return categoria === undefined || preferencias.categorias[categoria];
}
