/**
 * Regras de auditoria de preço e quilometragem.
 *
 * O projeto não possuía regra de desvio, sobrepreço ou classificação de risco.
 * Este arquivo é a única fonte dessas regras: cards, gráficos e tabela do
 * dashboard devem usar exclusivamente as funções abaixo.
 *
 * Base de comparação já existente no domínio:
 * - `Solicitacao.nValorEstimado` e `Solicitacao.nDistanciaEstimada` são o
 *   previsto, calculados pelo contrato na criação da solicitação.
 * - `Corrida.nKmPercorrido` e `Corrida.nValorFinal` são o realizado, gravados
 *   na finalização da corrida a partir das posições de GPS e das mesmas regras
 *   do contrato (`TrackingService.finish`).
 */

/** Percentual de diferença entre km realizado e km estimado que caracteriza desvio alto. */
export const LIMITE_DESVIO_ALTO_PERCENTUAL = lerLimiteConfiguravel(
  'DASHBOARD_LIMITE_DESVIO_ALTO_PERCENTUAL',
  20,
);

function lerLimiteConfiguravel(chave: string, padrao: number): number {
  const configurado = Number(process.env[chave]);

  return Number.isFinite(configurado) && configurado > 0
    ? configurado
    : padrao;
}

function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Desvio de quilometragem, com sinal: positivo quando o realizado é maior que
 * o estimado. Sem distância estimada não há base de comparação.
 */
export function calcularDesvioPercentual(
  distanciaEstimada: number,
  distanciaPercorrida: number,
): number {
  if (distanciaEstimada <= 0) return 0;

  return arredondar(
    ((distanciaPercorrida - distanciaEstimada) / distanciaEstimada) * 100,
  );
}

/** Magnitude do desvio, usada para ranquear e classificar. */
export function calcularDesvioAbsoluto(
  distanciaEstimada: number,
  distanciaPercorrida: number,
): number {
  return Math.abs(
    calcularDesvioPercentual(distanciaEstimada, distanciaPercorrida),
  );
}

export function ehDesvioAlto(
  distanciaEstimada: number,
  distanciaPercorrida: number,
): boolean {
  return (
    calcularDesvioAbsoluto(distanciaEstimada, distanciaPercorrida) >=
    LIMITE_DESVIO_ALTO_PERCENTUAL
  );
}

/** Cobrança acima do previsto. Economia não vira sobrepreço negativo. */
export function calcularSobrepreco(
  valorEstimado: number,
  valorFinal: number,
): number {
  return arredondar(Math.max(0, valorFinal - valorEstimado));
}

/**
 * Fornecedor em risco: o desvio agregado do fornecedor no período alcança o
 * limite de desvio alto. Usa os totais do fornecedor, não a média das corridas,
 * para que corridas curtas não distorçam o resultado.
 */
export function ehFornecedorEmRisco(totais: {
  kmEstimado: number;
  kmCobrado: number;
}): boolean {
  return ehDesvioAlto(totais.kmEstimado, totais.kmCobrado);
}
