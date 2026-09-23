export interface DashboardBigNumber {
  valor: number;
  variacaoPercentual: number | null;
}

export interface DashboardTopFornecedor {
  fornecedor: string | null;
  gasto: number;
  variacaoPercentual: number | null;
}

export interface DashboardGastoMensal {
  mes: string;
  gasto: number;
}

export interface DashboardGastoFornecedor {
  fornecedor: string;
  gasto: number;
}

export type DashboardStatusCorrida =
  | 'AGENDADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export interface DashboardCorrida {
  data: string;
  solicitanteNome: string;
  solicitanteEmail: string;
  destino: string;
  status: DashboardStatusCorrida;
  distanciaEstimada: number;
  distanciaPercorrida: number;
  preco: number;
}

export interface DashboardResponse {
  bigNumbers: {
    totalCorridas: DashboardBigNumber;
    corridasConcluidas: DashboardBigNumber;
    corridasEmergenciais: DashboardBigNumber;
    top1FornecedorPorGasto: DashboardTopFornecedor;
  };
  gastoMensal: DashboardGastoMensal[];
  gastoPorFornecedor: {
    total: number;
    fornecedores: DashboardGastoFornecedor[];
  };
  corridas: DashboardCorrida[];
}
