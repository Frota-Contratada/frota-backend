import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import {
  CorridaDashboardRegistro,
  DashboardRepositoryContract,
  FiltrosDashboardCorridas,
} from '../repositories/dashboard-repository.contract';
import {
  DashboardAuditoriaResponse,
  DashboardCorridaAuditada,
} from '../domain/dashboard-auditoria.types';
import {
  calcularDesvioAbsoluto,
  calcularDesvioPercentual,
  calcularSobrepreco,
  ehDesvioAlto,
  ehFornecedorEmRisco,
} from '../domain/auditoria-corrida';
import {
  arredondar,
  calcularVariacao,
  mesAnterior,
  resolverPeriodo,
} from '../domain/periodo-dashboard';
import {
  EscopoDashboard,
  FiltrosDashboardQuery,
} from './buscar-dashboard.service';

interface TotaisFornecedor {
  fornecedor: string;
  kmEstimado: number;
  kmCobrado: number;
}

@Injectable()
export class BuscarDashboardAuditoriaService {
  constructor(
    private readonly dashboardRepository: DashboardRepositoryContract,
  ) {}

  async execute(
    query: FiltrosDashboardQuery,
    escopo: EscopoDashboard = {},
  ): Promise<DashboardAuditoriaResponse> {
    const periodo = resolverPeriodo(query);
    const filtros = {
      inicio: periodo.inicio.toJSDate(),
      fim: periodo.fim.toJSDate(),
      filialId: escopo.filialId ?? query.filial,
      centroCustoId: query.centroCusto,
      aprovadorId: escopo.aprovadorId,
      somenteFinalizadas: true,
    } satisfies FiltrosDashboardCorridas;

    const anterior = mesAnterior(periodo);
    const [corridas, corridasAnteriores] = await Promise.all([
      this.dashboardRepository.buscarCorridas(filtros),
      this.dashboardRepository.buscarCorridas({
        ...filtros,
        inicio: anterior.inicio.toJSDate(),
        fim: anterior.fim.toJSDate(),
      }),
    ]);

    const totaisPorFornecedor = this.agruparPorFornecedor(corridas);
    const totaisAnteriores = this.agruparPorFornecedor(corridasAnteriores);

    const sobreprecoTotal = this.somarSobrepreco(corridas);
    const sobreprecoAnterior = this.somarSobrepreco(corridasAnteriores);
    const desvioAlto = this.contarDesvioAlto(corridas);
    const desvioAltoAnterior = this.contarDesvioAlto(corridasAnteriores);
    const maiorDesvio = this.calcularMaiorDesvio(corridas);
    const maiorDesvioAnterior = this.calcularMaiorDesvio(corridasAnteriores);
    const emRisco = this.contarFornecedoresEmRisco(totaisPorFornecedor);
    const emRiscoAnterior = this.contarFornecedoresEmRisco(totaisAnteriores);

    return {
      bigNumbers: {
        sobreprecoTotal: {
          valor: sobreprecoTotal,
          variacaoPercentual: calcularVariacao(
            sobreprecoTotal,
            sobreprecoAnterior,
          ),
        },
        corridasDesvioAlto: {
          quantidade: desvioAlto,
          variacaoPercentual: calcularVariacao(desvioAlto, desvioAltoAnterior),
        },
        maiorDesvio: {
          percentual: maiorDesvio,
          variacaoPercentual: calcularVariacao(
            maiorDesvio,
            maiorDesvioAnterior,
          ),
        },
        fornecedoresEmRisco: {
          quantidade: emRisco,
          variacaoPercentual: calcularVariacao(emRisco, emRiscoAnterior),
        },
      },
      conformidadeQuilometragem: this.montarConformidade(totaisPorFornecedor),
      maioresDesviosFornecedores: this.montarMaioresDesvios(
        totaisPorFornecedor,
      ),
      corridas: corridas.map((corrida) => this.montarCorrida(corrida)),
    };
  }

  private somarSobrepreco(corridas: CorridaDashboardRegistro[]): number {
    return arredondar(
      corridas.reduce(
        (total, corrida) =>
          total + calcularSobrepreco(corrida.valorEstimado, corrida.preco),
        0,
      ),
    );
  }

  private contarDesvioAlto(corridas: CorridaDashboardRegistro[]): number {
    return corridas.filter((corrida) =>
      ehDesvioAlto(corrida.distanciaEstimada, corrida.distanciaPercorrida),
    ).length;
  }

  private calcularMaiorDesvio(corridas: CorridaDashboardRegistro[]): number {
    return arredondar(
      corridas.reduce(
        (maior, corrida) =>
          Math.max(
            maior,
            calcularDesvioAbsoluto(
              corrida.distanciaEstimada,
              corrida.distanciaPercorrida,
            ),
          ),
        0,
      ),
    );
  }

  private agruparPorFornecedor(
    corridas: CorridaDashboardRegistro[],
  ): TotaisFornecedor[] {
    const totais = new Map<number, TotaisFornecedor>();

    for (const corrida of corridas) {
      const atual = totais.get(corrida.fornecedorId);

      totais.set(corrida.fornecedorId, {
        fornecedor: corrida.fornecedorNome,
        kmEstimado: (atual?.kmEstimado ?? 0) + corrida.distanciaEstimada,
        kmCobrado: (atual?.kmCobrado ?? 0) + corrida.distanciaPercorrida,
      });
    }

    return [...totais.values()];
  }

  private contarFornecedoresEmRisco(totais: TotaisFornecedor[]): number {
    return totais.filter((fornecedor) => ehFornecedorEmRisco(fornecedor))
      .length;
  }

  private montarConformidade(
    totais: TotaisFornecedor[],
  ): DashboardAuditoriaResponse['conformidadeQuilometragem'] {
    return [...totais]
      .sort((um, outro) => outro.kmEstimado - um.kmEstimado)
      .map((fornecedor) => ({
        fornecedor: fornecedor.fornecedor,
        kmEstimado: arredondar(fornecedor.kmEstimado),
        kmCobrado: arredondar(fornecedor.kmCobrado),
      }));
  }

  private montarMaioresDesvios(
    totais: TotaisFornecedor[],
  ): DashboardAuditoriaResponse['maioresDesviosFornecedores'] {
    return totais
      .map((fornecedor) => ({
        fornecedor: fornecedor.fornecedor,
        desvioPercentual: calcularDesvioAbsoluto(
          fornecedor.kmEstimado,
          fornecedor.kmCobrado,
        ),
      }))
      .sort((um, outro) => {
        const diferenca = outro.desvioPercentual - um.desvioPercentual;

        return diferenca !== 0
          ? diferenca
          : um.fornecedor.localeCompare(outro.fornecedor);
      });
  }

  private montarCorrida(
    corrida: CorridaDashboardRegistro,
  ): DashboardCorridaAuditada {
    return {
      data: DateTime.fromJSDate(corrida.data).toISODate() ?? '',
      solicitanteNome: corrida.solicitanteNome,
      solicitanteEmail: corrida.solicitanteEmail,
      fornecedor: corrida.fornecedorNome,
      distanciaEstimada: corrida.distanciaEstimada,
      distanciaPercorrida: corrida.distanciaPercorrida,
      desvioPercentual: calcularDesvioPercentual(
        corrida.distanciaEstimada,
        corrida.distanciaPercorrida,
      ),
      preco: arredondar(corrida.preco),
    };
  }
}
