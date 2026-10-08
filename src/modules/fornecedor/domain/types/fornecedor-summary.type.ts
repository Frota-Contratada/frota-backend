import { DateTime } from 'luxon';

export type ContratoVigenteSummary = {
  contratoId: number;
  empresaId: number;
  filialId: number;
  filialNome: string;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  dataAlteracao: DateTime;
};

export type FornecedorSummary = {
  id: number;
  nome: string;
  cnpjCpf: string | null;
  dataAtivacao: DateTime;
  ativo: boolean;
  quantidadeVeiculosAtivos: number;
  contratosVigentes: ContratoVigenteSummary[];
};
