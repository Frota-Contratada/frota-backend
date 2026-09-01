/**
 * Tipos de condição de uma regra, persistidos em CondicaoRegra.cTipoCondicao.
 * O conteúdo de CondicaoRegra.cValor é serializado conforme o tipo.
 * Todas as condições de uma mesma regra precisam ser satisfeitas (AND);
 * dentro de uma condição de lista, basta um item bater (OR).
 */
export enum TipoCondicao {
  DIAS_SEMANA = 'dias-semana',
  PERIODO = 'periodo',
  ROTA_FIXA = 'rota-fixa',
  TIPO_VEICULO = 'tipo-veiculo',
  TIPO_CORRIDA = 'tipo-corrida',
  OUTRO = 'outro',
}
