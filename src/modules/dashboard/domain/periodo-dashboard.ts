import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

export interface PeriodoDashboard {
  inicio: DateTime;
  fim: DateTime;
}

const ROTULOS_MES = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

/**
 * Sem datas informadas o dashboard considera o ano atual, de 1º de janeiro até
 * hoje. Com datas informadas o período é respeitado integralmente, inclusive
 * quando pertence a outro ano.
 */
export function resolverPeriodo(filtros: {
  startDate?: string;
  endDate?: string;
}): PeriodoDashboard {
  const agora = DateTime.now();
  const inicio = filtros.startDate
    ? DateTime.fromISO(filtros.startDate).startOf('day')
    : agora.startOf('year');
  const fim = filtros.endDate
    ? DateTime.fromISO(filtros.endDate).endOf('day')
    : agora.endOf('day');

  if (!inicio.isValid || !fim.isValid || inicio.toMillis() > fim.toMillis()) {
    throw new BadRequestException(
      'O período informado para o dashboard é inválido.',
    );
  }

  return { inicio, fim };
}

/** Período de comparação: mês calendário anterior ao início do período atual. */
export function mesAnterior(periodo: PeriodoDashboard): PeriodoDashboard {
  const mes = periodo.inicio.startOf('month').minus({ months: 1 });

  return { inicio: mes.startOf('month'), fim: mes.endOf('month') };
}

export function calcularVariacao(
  atual: number,
  anterior: number,
): number | null {
  if (anterior === 0) return atual === 0 ? 0 : null;

  return arredondar(((atual - anterior) / anterior) * 100);
}

export function rotuloDoMes(data: DateTime, incluiAno: boolean): string {
  const mes = ROTULOS_MES[data.month - 1];

  return incluiAno ? `${mes}/${data.year}` : mes;
}

export function mesesDoPeriodo(periodo: PeriodoDashboard): DateTime[] {
  const ultimo = periodo.fim.startOf('month');
  const meses: DateTime[] = [];

  for (
    let mes = periodo.inicio.startOf('month');
    mes.toMillis() <= ultimo.toMillis();
    mes = mes.plus({ months: 1 })
  ) {
    meses.push(mes);
  }

  return meses;
}

export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}
