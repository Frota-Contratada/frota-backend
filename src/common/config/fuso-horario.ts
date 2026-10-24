/**
 * Fuso em que as regras de negócio interpretam horários: período e dia da
 * semana da precificação e limites de dia das agendas. As datas continuam
 * gravadas em UTC; o fuso só é aplicado no cálculo e na leitura de datas
 * vindas dos filtros.
 */
export const FUSO_HORARIO_PADRAO = 'America/Sao_Paulo';

export function fusoHorarioOperacao(
  configurado = process.env.FUSO_HORARIO,
): string {
  return configurado?.trim() || FUSO_HORARIO_PADRAO;
}
