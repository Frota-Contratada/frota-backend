/**
 * Define a forma de custo aplicada pela regra. Os valores são persistidos na
 * tabela TipoRegra pelos IDs definidos em TIPO_REGRA_ID.
 */
export enum TipoRegra {
  VALOR_KM = 'VALOR_KM',
  VALOR_FIXO = 'VALOR_FIXO',
  PERCENTUAL = 'PERCENTUAL',
}

export const TIPO_REGRA_ID: Record<TipoRegra, number> = {
  [TipoRegra.VALOR_KM]: 1,
  [TipoRegra.VALOR_FIXO]: 2,
  [TipoRegra.PERCENTUAL]: 3,
};
