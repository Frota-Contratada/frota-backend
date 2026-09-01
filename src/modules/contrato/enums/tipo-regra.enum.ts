/**
 * Determina qual campo de valor da regra é usado:
 *   VALOR_KM    -> valorKm
 *   VALOR_FIXO  -> valorFixo
 *   PERCENTUAL  -> percentual
 */
export enum TipoRegra {
  VALOR_KM = 'valor-km',
  VALOR_FIXO = 'valor-fixo',
  PERCENTUAL = 'percentual',
}
