import { DateTime } from 'luxon';

export enum Periodo {
  MATUTINO = 'MATUTINO',
  VESPERTINO = 'VESPERTINO',
  NOTURNO = 'NOTURNO',
}

/**
 * Faixas em horas inteiras. NOTURNO cruza a meia-noite, das 18h às 5h59.
 */
export const FAIXA_HORARIA_PERIODO: Record<
  Periodo,
  { horaInicio: number; horaFim: number }
> = {
  [Periodo.MATUTINO]: { horaInicio: 6, horaFim: 11 },
  [Periodo.VESPERTINO]: { horaInicio: 12, horaFim: 17 },
  [Periodo.NOTURNO]: { horaInicio: 18, horaFim: 5 },
};

export function resolverPeriodo(momento: DateTime): Periodo {
  const hora = momento.hour;

  const matutino = FAIXA_HORARIA_PERIODO[Periodo.MATUTINO];
  if (hora >= matutino.horaInicio && hora <= matutino.horaFim) {
    return Periodo.MATUTINO;
  }

  const vespertino = FAIXA_HORARIA_PERIODO[Periodo.VESPERTINO];
  if (hora >= vespertino.horaInicio && hora <= vespertino.horaFim) {
    return Periodo.VESPERTINO;
  }

  return Periodo.NOTURNO;
}
