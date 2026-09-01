/**
 * Ciclo de vida do contrato, persistido em Contrato.cSituacao.
 * Não confundir com StatusContrato, que é derivado da vigência.
 *
 * Transições permitidas:
 *   RASCUNHO  -> PUBLICADO | DELETADO
 *   PUBLICADO -> DELETADO
 *   DELETADO  -> (final)
 *
 * Só contratos em RASCUNHO podem ser editados.
 * Só contratos em PUBLICADO podem ser usados para precificar uma solicitação.
 */
export enum SituacaoContrato {
  RASCUNHO = 'rascunho',
  PUBLICADO = 'publicado',
  DELETADO = 'deletado',
}
