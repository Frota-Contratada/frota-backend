export interface FiltrosDashboardCorridas {
  inicio: Date;
  fim: Date;
  filialId?: number;
  centroCustoId?: number;
  aprovadorId?: number;
  /** Usado pelo dashboard de gastos, onde cancelamentos não geram custo. */
  desconsiderarCanceladas?: boolean;
  /**
   * Usado pela auditoria: somente corridas finalizadas possuem quilometragem e
   * valor final reais para comparar com o previsto.
   */
  somenteFinalizadas?: boolean;
}

export interface CorridaDashboardRegistro {
  id: number;
  data: Date;
  status: string;
  tipoCorridaId: number;
  fornecedorId: number;
  fornecedorNome: string;
  solicitanteNome: string;
  solicitanteEmail: string;
  destino: string;
  distanciaEstimada: number;
  distanciaPercorrida: number;
  /** Previsto pelo contrato na criação da solicitação. */
  valorEstimado: number;
  /** Realizado, gravado na finalização da corrida. */
  preco: number;
}

export interface RateioDashboard {
  filialId: number;
  centroCustoId: number;
  centroCustoNome: string;
  responsavelNome: string;
}

export interface CorridaGastoRegistro {
  id: number;
  data: Date;
  fornecedorId: number;
  fornecedorNome: string;
  preco: number;
  /**
   * Total de rateios da solicitação, usado para dividir o valor igualmente
   * entre os centros de custo, mesmo quando os filtros retornam só parte deles.
   */
  totalRateios: number;
  rateios: RateioDashboard[];
}

export abstract class DashboardRepositoryContract {
  abstract buscarCorridas(
    filtros: FiltrosDashboardCorridas,
  ): Promise<CorridaDashboardRegistro[]>;
  abstract buscarGastos(
    filtros: FiltrosDashboardCorridas,
  ): Promise<CorridaGastoRegistro[]>;
}
