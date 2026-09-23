import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { TipoCorridaEnum } from '@module/solicitacao/enums/tipo-corrida.enum';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import {
  CorridaDashboardRegistro,
  DashboardRepositoryContract,
  FiltrosDashboardCorridas,
} from '../repositories/dashboard-repository.contract';
import {
  DashboardCorrida,
  DashboardResponse,
  DashboardStatusCorrida,
} from '../domain/dashboard.types';
import {
  arredondar,
  calcularVariacao,
  mesAnterior,
  mesesDoPeriodo,
  PeriodoDashboard,
  resolverPeriodo,
  rotuloDoMes,
} from '../domain/periodo-dashboard';

export interface FiltrosDashboardQuery {
  startDate?: string;
  endDate?: string;
  filial?: number;
  centroCusto?: number;
}

export interface EscopoDashboard {
  filialId?: number;
  aprovadorId?: number;
}

@Injectable()
export class BuscarDashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepositoryContract,
  ) {}

  async execute(
    query: FiltrosDashboardQuery,
    escopo: EscopoDashboard = {},
  ): Promise<DashboardResponse> {
    const periodo = resolverPeriodo(query);
    const filtros = {
      inicio: periodo.inicio.toJSDate(),
      fim: periodo.fim.toJSDate(),
      filialId: escopo.filialId ?? query.filial,
      centroCustoId: query.centroCusto,
      aprovadorId: escopo.aprovadorId,
    } satisfies FiltrosDashboardCorridas;

    const anterior = mesAnterior(periodo);
    const filtrosAnteriores = {
      ...filtros,
      inicio: anterior.inicio.toJSDate(),
      fim: anterior.fim.toJSDate(),
    };

    const [corridas, corridasAnteriores] = await Promise.all([
      this.dashboardRepository.buscarCorridas(filtros),
      this.dashboardRepository.buscarCorridas(filtrosAnteriores),
    ]);

    return {
      bigNumbers: this.montarBigNumbers(corridas, corridasAnteriores),
      gastoMensal: this.montarGastoMensal(corridas, periodo),
      gastoPorFornecedor: this.montarGastoPorFornecedor(corridas),
      corridas: corridas.map((corrida) => this.montarCorrida(corrida)),
    };
  }

  private montarBigNumbers(
    corridas: CorridaDashboardRegistro[],
    corridasAnteriores: CorridaDashboardRegistro[],
  ): DashboardResponse['bigNumbers'] {
    const totalAtual = corridas.length;
    const totalAnterior = corridasAnteriores.length;
    const concluidasAtual = this.contarConcluidas(corridas);
    const concluidasAnterior = this.contarConcluidas(corridasAnteriores);
    const emergenciaisAtual = this.contarEmergenciais(corridas);
    const emergenciaisAnterior = this.contarEmergenciais(corridasAnteriores);
    const fornecedorAtual = this.buscarTopFornecedor(corridas);
    const gastoAnteriorDoFornecedor = fornecedorAtual
      ? this.gastoDoFornecedor(corridasAnteriores, fornecedorAtual.id)
      : 0;

    return {
      totalCorridas: {
        valor: totalAtual,
        variacaoPercentual: calcularVariacao(totalAtual, totalAnterior),
      },
      corridasConcluidas: {
        valor: concluidasAtual,
        variacaoPercentual: calcularVariacao(
          concluidasAtual,
          concluidasAnterior,
        ),
      },
      corridasEmergenciais: {
        valor: emergenciaisAtual,
        variacaoPercentual: calcularVariacao(
          emergenciaisAtual,
          emergenciaisAnterior,
        ),
      },
      top1FornecedorPorGasto: {
        fornecedor: fornecedorAtual?.nome ?? null,
        gasto: fornecedorAtual?.gasto ?? 0,
        variacaoPercentual: fornecedorAtual
          ? calcularVariacao(fornecedorAtual.gasto, gastoAnteriorDoFornecedor)
          : null,
      },
    };
  }

  private contarConcluidas(corridas: CorridaDashboardRegistro[]): number {
    return corridas.filter(
      (corrida) => corrida.status === `${StatusCorrida.FINALIZADA}`,
    ).length;
  }

  private contarEmergenciais(corridas: CorridaDashboardRegistro[]): number {
    return corridas.filter(
      (corrida) =>
        corrida.tipoCorridaId === Number(TipoCorridaEnum.EMERGENCIAL),
    ).length;
  }

  private buscarTopFornecedor(corridas: CorridaDashboardRegistro[]): {
    id: number;
    nome: string;
    gasto: number;
  } | null {
    const gastos = new Map<number, { nome: string; gasto: number }>();

    for (const corrida of corridas) {
      const atual = gastos.get(corrida.fornecedorId);
      gastos.set(corrida.fornecedorId, {
        nome: corrida.fornecedorNome,
        gasto: (atual?.gasto ?? 0) + corrida.preco,
      });
    }

    const top = [...gastos.entries()].sort(([, um], [, outro]) => {
      const diferenca = outro.gasto - um.gasto;
      return diferenca !== 0 ? diferenca : um.nome.localeCompare(outro.nome);
    })[0];

    return top
      ? { id: top[0], nome: top[1].nome, gasto: arredondar(top[1].gasto) }
      : null;
  }

  private gastoDoFornecedor(
    corridas: CorridaDashboardRegistro[],
    fornecedorId: number,
  ): number {
    return arredondar(
      corridas
        .filter((corrida) => corrida.fornecedorId === fornecedorId)
        .reduce((total, corrida) => total + corrida.preco, 0),
    );
  }

  private montarGastoMensal(
    corridas: CorridaDashboardRegistro[],
    periodo: PeriodoDashboard,
  ): DashboardResponse['gastoMensal'] {
    const meses = new Map<string, { data: DateTime; gasto: number }>(
      mesesDoPeriodo(periodo).map((mes) => [
        mes.toFormat('yyyy-MM'),
        { data: mes, gasto: 0 },
      ]),
    );

    for (const corrida of corridas) {
      const mes = meses.get(
        DateTime.fromJSDate(corrida.data).toFormat('yyyy-MM'),
      );
      if (mes) mes.gasto += corrida.preco;
    }

    const possuiMaisDeUmAno = periodo.inicio.year !== periodo.fim.year;

    return [...meses.values()].map((mes) => ({
      mes: rotuloDoMes(mes.data, possuiMaisDeUmAno),
      gasto: arredondar(mes.gasto),
    }));
  }

  private montarGastoPorFornecedor(
    corridas: CorridaDashboardRegistro[],
  ): DashboardResponse['gastoPorFornecedor'] {
    const gastos = new Map<number, { nome: string; gasto: number }>();

    for (const corrida of corridas) {
      const atual = gastos.get(corrida.fornecedorId);
      gastos.set(corrida.fornecedorId, {
        nome: corrida.fornecedorNome,
        gasto: (atual?.gasto ?? 0) + corrida.preco,
      });
    }

    const fornecedores = [...gastos.values()]
      .sort((um, outro) => {
        const diferenca = outro.gasto - um.gasto;
        return diferenca !== 0 ? diferenca : um.nome.localeCompare(outro.nome);
      })
      .map((fornecedor) => ({
        fornecedor: fornecedor.nome,
        gasto: arredondar(fornecedor.gasto),
      }));

    return {
      total: arredondar(
        corridas.reduce((total, corrida) => total + corrida.preco, 0),
      ),
      fornecedores,
    };
  }

  private montarCorrida(corrida: CorridaDashboardRegistro): DashboardCorrida {
    return {
      data: DateTime.fromJSDate(corrida.data).toISODate() ?? '',
      solicitanteNome: corrida.solicitanteNome,
      solicitanteEmail: corrida.solicitanteEmail,
      destino: corrida.destino,
      status: this.mapearStatus(corrida.status),
      distanciaEstimada: corrida.distanciaEstimada,
      distanciaPercorrida: corrida.distanciaPercorrida,
      preco: arredondar(corrida.preco),
    };
  }

  private mapearStatus(status: string): DashboardStatusCorrida {
    switch (status.trim()) {
      case `${StatusCorrida.AGENDADA}`:
        return 'AGENDADA';
      case `${StatusCorrida.INICIADA}`:
        return 'EM_ANDAMENTO';
      case `${StatusCorrida.FINALIZADA}`:
        return 'CONCLUIDO';
      case `${StatusCorrida.CANCELADA}`:
        return 'CANCELADO';
      default:
        return 'AGENDADA';
    }
  }
}
