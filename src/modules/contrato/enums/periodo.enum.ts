import { DateTime } from 'luxon';

export enum Periodo {
  MATUTINO = 'matutino',
  VESPERTINO = 'vespertino',
  NOTURNO = 'noturno',
}

/**
 * Faixas em horas cheias, com início e fim inclusivos.
 * NOTURNO cruza a meia-noite (18h de um dia até 5h do dia seguinte).
 */
export const FAIXA_HORARIA_PERIODO: Record<
  Periodo,
  { horaInicio: number; horaFim: number }
> = {
  [Periodo.MATUTINO]: { horaInicio: 6, horaFim: 11 },
  [Periodo.VESPERTINO]: { horaInicio: 12, horaFim: 17 },
  [Periodo.NOTURNO]: { horaInicio: 18, horaFim: 5 },
};

/**
 * Resolve o período de um instante. Use a data de início da corrida no valor
 * final e a data prevista da corrida na estimativa.
 */
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
