import { TIPO_REGRA_ID, TipoRegra } from '../../contrato/enums/tipo-regra.enum';

export interface RegraDeValor {
  id: number;
  prioridade: number;
  tipoRegraId?: number;
  valorFixo?: number;
  valorKm?: number;
  percentual?: number;
}

export interface RegraCobrada {
  regraId: number;
  valorCobrado: number;
}

export interface ValorPorRegras {
  valor: number;
  regrasAplicadas: RegraCobrada[];
}

/**
 * A primeira regra de valor (km ou fixo) por prioridade define a base da
 * corrida; as demais regras de valor são ignoradas. Regras percentuais
 * aplicáveis incidem sobre essa base, sem se acumularem entre si. A primeira
 * regra de tempo de espera cobra o valor por hora proporcional aos minutos
 * esperados (zero na estimativa). Sem regra de valor aplicável, o contrato
 * não precifica a corrida.
 */
export function calcularValorPorRegras(
  regras: RegraDeValor[],
  distanciaKm: number,
  minutosEspera = 0,
): ValorPorRegras | undefined {
  const ordenadas = [...regras].sort(
    (uma, outra) => uma.prioridade - outra.prioridade,
  );
  const base = ordenadas.find(
    (regra) => !ehPercentual(regra) && !ehTempoEspera(regra),
  );

  if (base == null) return undefined;

  const valorBase = (base.valorFixo ?? 0) + (base.valorKm ?? 0) * distanciaKm;
  const regrasAplicadas: RegraCobrada[] = [
    { regraId: base.id, valorCobrado: arredondar(valorBase) },
  ];
  let valor = valorBase;

  for (const regra of ordenadas.filter(ehPercentual)) {
    const acrescimo = valorBase * ((regra.percentual ?? 0) / 100);
    valor += acrescimo;
    regrasAplicadas.push({
      regraId: regra.id,
      valorCobrado: arredondar(acrescimo),
    });
  }

  const espera = ordenadas.find(ehTempoEspera);

  if (espera != null) {
    const valorEspera = ((espera.valorFixo ?? 0) * minutosEspera) / 60;
    valor += valorEspera;
    regrasAplicadas.push({
      regraId: espera.id,
      valorCobrado: arredondar(valorEspera),
    });
  }

  return { valor: arredondar(valor), regrasAplicadas };
}

function ehPercentual(regra: RegraDeValor): boolean {
  return regra.tipoRegraId === TIPO_REGRA_ID[TipoRegra.PERCENTUAL];
}

function ehTempoEspera(regra: RegraDeValor): boolean {
  return regra.tipoRegraId === TIPO_REGRA_ID[TipoRegra.TEMPO_ESPERA];
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
