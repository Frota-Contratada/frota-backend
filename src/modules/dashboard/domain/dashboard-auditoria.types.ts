export interface DashboardAuditoriaValor {
  valor: number;
  variacaoPercentual: number | null;
}

export interface DashboardAuditoriaQuantidade {
  quantidade: number;
  variacaoPercentual: number | null;
}

export interface DashboardAuditoriaPercentual {
  percentual: number;
  variacaoPercentual: number | null;
}

export interface DashboardConformidadeQuilometragem {
  fornecedor: string;
  kmEstimado: number;
  kmCobrado: number;
}

export interface DashboardDesvioFornecedor {
  fornecedor: string;
  desvioPercentual: number;
}

export interface DashboardCorridaAuditada {
  data: string;
  solicitanteNome: string;
  solicitanteEmail: string;
  fornecedor: string;
  distanciaEstimada: number;
  distanciaPercorrida: number;
  desvioPercentual: number;
  preco: number;
}

export interface DashboardAuditoriaResponse {
  bigNumbers: {
    sobreprecoTotal: DashboardAuditoriaValor;
    corridasDesvioAlto: DashboardAuditoriaQuantidade;
    maiorDesvio: DashboardAuditoriaPercentual;
    fornecedoresEmRisco: DashboardAuditoriaQuantidade;
  };
  conformidadeQuilometragem: DashboardConformidadeQuilometragem[];
  maioresDesviosFornecedores: DashboardDesvioFornecedor[];
  corridas: DashboardCorridaAuditada[];
}
