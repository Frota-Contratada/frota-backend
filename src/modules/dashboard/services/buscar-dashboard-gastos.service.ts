import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import {
  CorridaGastoRegistro,
  DashboardRepositoryContract,
  FiltrosDashboardCorridas,
} from '../repositories/dashboard-repository.contract';
import {
  DashboardCentroCustoResumo,
  DashboardGastoCentroCusto,
  DashboardGastosResponse,
} from '../domain/dashboard-gastos.types';
import {
  arredondar,
  calcularVariacao,
  mesAnterior,
  mesesDoPeriodo,
  PeriodoDashboard,
  resolverPeriodo,
  rotuloDoMes,
} from '../domain/periodo-dashboard';
import {
  EscopoDashboard,
  FiltrosDashboardQuery,
} from './buscar-dashboard.service';

const LIMITE_MAIORES_GASTOS = 5;

interface GastoCentroCusto {
  centroCustoId: number;
  centroCusto: string;
  responsavel: string;
  valor: number;
}

@Injectable()
export class BuscarDashboardGastosService {
  constructor(
    private readonly dashboardRepository: DashboardRepositoryContract,
  ) {}

  async execute(
    query: FiltrosDashboardQuery,
    escopo: EscopoDashboard = {},
  ): Promise<DashboardGastosResponse> {
    const periodo = resolverPeriodo(query);
    const filtros = {
      inicio: periodo.inicio.toJSDate(),
      fim: periodo.fim.toJSDate(),
      filialId: escopo.filialId ?? query.filial,
      centroCustoId: query.centroCusto,
      aprovadorId: escopo.aprovadorId,
      desconsiderarCanceladas: true,
    } satisfies FiltrosDashboardCorridas;

    const anterior = mesAnterior(periodo);
    const [gastos, gastosAnteriores] = await Promise.all([
      this.dashboardRepository.buscarGastos(filtros),
      this.dashboardRepository.buscarGastos({
        ...filtros,
        inicio: anterior.inicio.toJSDate(),
        fim: anterior.fim.toJSDate(),
      }),
    ]);

    const centrosCusto = this.agruparPorCentroCusto(gastos);
    const centrosCustoAnteriores = this.agruparPorCentroCusto(gastosAnteriores);
    const topCentroCusto = centrosCusto.at(0) ?? null;
    const gastoAnteriorDoTopCentro = topCentroCusto
      ? (centrosCustoAnteriores.find(
          (centro) => centro.centroCustoId === topCentroCusto.centroCustoId,
        )?.valor ?? 0)
      : 0;

    const gastoTotal = this.somarGastos(gastos);
    const gastoTotalAnterior = this.somarGastos(gastosAnteriores);
    const precoMedio = this.calcularPrecoMedio(gastos);
    const precoMedioAnterior = this.calcularPrecoMedio(gastosAnteriores);
    const maiorPreco = this.calcularMaiorPreco(gastos);
    const maiorPrecoAnterior = this.calcularMaiorPreco(gastosAnteriores);

    return {
      bigNumbers: {
        gastoTotal: {
          valor: gastoTotal,
          variacaoPercentual: calcularVariacao(gastoTotal, gastoTotalAnterior),
        },
        precoMedio: {
          valor: precoMedio,
          variacaoPercentual: calcularVariacao(precoMedio, precoMedioAnterior),
        },
        topCentroCusto: {
          centroCustoId: topCentroCusto?.centroCustoId ?? null,
          centroCusto: topCentroCusto?.centroCusto ?? null,
          gasto: topCentroCusto?.valor ?? 0,
          variacaoPercentual: topCentroCusto
            ? calcularVariacao(topCentroCusto.valor, gastoAnteriorDoTopCentro)
            : null,
        },
        maiorPreco: {
          valor: maiorPreco,
          variacaoPercentual: calcularVariacao(maiorPreco, maiorPrecoAnterior),
        },
      },
      maioresGastosCentroCusto: this.montarMaioresGastos(centrosCusto),
      centrosCusto: this.montarResumoCentrosCusto(centrosCusto),
      evolucaoGastos: this.montarEvolucaoGastos(gastos, periodo),
    };
  }

  /**
   * O valor da corrida é dividido igualmente entre os rateios da solicitação.
   * Quando os filtros restringem os centros de custo, apenas a parcela dos
   * rateios correspondentes é considerada.
   */
  private valorAtribuido(gasto: CorridaGastoRegistro): number {
    if (gasto.totalRateios === 0) return gasto.preco;

    return (gasto.preco / gasto.totalRateios) * gasto.rateios.length;
  }

  private somarGastos(gastos: CorridaGastoRegistro[]): number {
    return arredondar(
      gastos.reduce((total, gasto) => total + this.valorAtribuido(gasto), 0),
    );
  }

  private calcularPrecoMedio(gastos: CorridaGastoRegistro[]): number {
    if (gastos.length === 0) return 0;

    const total = gastos.reduce(
      (soma, gasto) => soma + this.valorAtribuido(gasto),
      0,
    );

    return arredondar(total / gastos.length);
  }

  private calcularMaiorPreco(gastos: CorridaGastoRegistro[]): number {
    return arredondar(
      gastos.reduce(
        (maior, gasto) => Math.max(maior, this.valorAtribuido(gasto)),
        0,
      ),
    );
  }

  private agruparPorCentroCusto(
    gastos: CorridaGastoRegistro[],
  ): GastoCentroCusto[] {
    const centros = new Map<string, GastoCentroCusto>();

    for (const gasto of gastos) {
      if (gasto.totalRateios === 0) continue;

      const valorPorRateio = gasto.preco / gasto.totalRateios;

      for (const rateio of gasto.rateios) {
        const chave = `${rateio.filialId}-${rateio.centroCustoId}`;
        const atual = centros.get(chave);

        centros.set(chave, {
          centroCustoId: rateio.centroCustoId,
          centroCusto: rateio.centroCustoNome,
          responsavel: rateio.responsavelNome,
          valor: (atual?.valor ?? 0) + valorPorRateio,
        });
      }
    }

    return [...centros.values()]
      .map((centro) => ({ ...centro, valor: arredondar(centro.valor) }))
      .sort((um, outro) => {
        const diferenca = outro.valor - um.valor;

        return diferenca !== 0
          ? diferenca
          : um.centroCusto.localeCompare(outro.centroCusto);
      });
  }

  private montarMaioresGastos(
    centrosCusto: GastoCentroCusto[],
  ): DashboardGastoCentroCusto[] {
    return centrosCusto.slice(0, LIMITE_MAIORES_GASTOS).map((centro) => ({
      centroCustoId: centro.centroCustoId,
      centroCusto: centro.centroCusto,
      valor: centro.valor,
    }));
  }

  private montarResumoCentrosCusto(
    centrosCusto: GastoCentroCusto[],
  ): DashboardCentroCustoResumo[] {
    return centrosCusto.map((centro) => ({
      centroCustoId: centro.centroCustoId,
      centroCusto: centro.centroCusto,
      responsavel: centro.responsavel,
      valor: centro.valor,
    }));
  }

  private montarEvolucaoGastos(
    gastos: CorridaGastoRegistro[],
    periodo: PeriodoDashboard,
  ): DashboardGastosResponse['evolucaoGastos'] {
    const fornecedores = new Map<number, string>();
    const porMes = new Map<string, Map<number, number>>();

    for (const mes of mesesDoPeriodo(periodo)) {
      porMes.set(mes.toFormat('yyyy-MM'), new Map());
    }

    for (const gasto of gastos) {
      fornecedores.set(gasto.fornecedorId, gasto.fornecedorNome);

      const chave = DateTime.fromJSDate(gasto.data).toFormat('yyyy-MM');
      const mes = porMes.get(chave);
      if (!mes) continue;

      mes.set(
        gasto.fornecedorId,
        (mes.get(gasto.fornecedorId) ?? 0) + this.valorAtribuido(gasto),
      );
    }

    const fornecedoresOrdenados = [...fornecedores.entries()].sort(
      ([, um], [, outro]) => um.localeCompare(outro),
    );
    const possuiMaisDeUmAno = periodo.inicio.year !== periodo.fim.year;

    return mesesDoPeriodo(periodo).map((mes) => {
      const valores = porMes.get(mes.toFormat('yyyy-MM'));

      return {
        periodo: rotuloDoMes(mes, possuiMaisDeUmAno),
        fornecedores: fornecedoresOrdenados.map(([id, nome]) => ({
          fornecedor: nome,
          valor: arredondar(valores?.get(id) ?? 0),
        })),
      };
    });
  }
}
