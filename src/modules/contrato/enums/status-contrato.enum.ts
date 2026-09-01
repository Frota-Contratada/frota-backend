/**
 * Derivado da vigência do contrato, não persistido.
 * Para o ciclo de vida (rascunho/publicado/deletado), ver SituacaoContrato.
 */
export enum StatusContrato {
  AGENDADO = 'agendado',
  VIGENTE = 'vigente',
  VENCE_EM_BREVE = 'vence-em-breve',
  VENCIDO = 'vencido',
}

export const DIAS_PARA_VENCER_EM_BREVE = 30;
