/**
 * Define a forma de custo aplicada pela regra. Os valores são persistidos na
 * tabela TipoRegra pelos IDs definidos em TIPO_REGRA_ID.
 *
 * TEMPO_ESPERA usa `valorFixo` como valor por hora de espera, cobrado
 * proporcionalmente aos minutos registrados no acompanhamento da corrida.
 */
export enum TipoRegra {
  VALOR_KM = 'VALOR_KM',
  VALOR_FIXO = 'VALOR_FIXO',
  PERCENTUAL = 'PERCENTUAL',
  TEMPO_ESPERA = 'TEMPO_ESPERA',
}

export const TIPO_REGRA_ID: Record<TipoRegra, number> = {
  [TipoRegra.VALOR_KM]: 1,
  [TipoRegra.VALOR_FIXO]: 2,
  [TipoRegra.PERCENTUAL]: 3,
  [TipoRegra.TEMPO_ESPERA]: 4,
};
