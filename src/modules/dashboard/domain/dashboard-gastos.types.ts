export interface DashboardGastoIndicador {
  valor: number;
  variacaoPercentual: number | null;
}

export interface DashboardTopCentroCusto {
  centroCustoId: number | null;
  centroCusto: string | null;
  gasto: number;
  variacaoPercentual: number | null;
}

export interface DashboardGastoCentroCusto {
  centroCustoId: number;
  centroCusto: string;
  valor: number;
}

export interface DashboardCentroCustoResumo {
  centroCustoId: number;
  centroCusto: string;
  responsavel: string;
  valor: number;
}

export interface DashboardEvolucaoFornecedor {
  fornecedor: string;
  valor: number;
}

export interface DashboardEvolucaoGasto {
  periodo: string;
  fornecedores: DashboardEvolucaoFornecedor[];
}

export interface DashboardGastosResponse {
  bigNumbers: {
    gastoTotal: DashboardGastoIndicador;
    precoMedio: DashboardGastoIndicador;
    topCentroCusto: DashboardTopCentroCusto;
    maiorPreco: DashboardGastoIndicador;
  };
  maioresGastosCentroCusto: DashboardGastoCentroCusto[];
  centrosCusto: DashboardCentroCustoResumo[];
  evolucaoGastos: DashboardEvolucaoGasto[];
}
