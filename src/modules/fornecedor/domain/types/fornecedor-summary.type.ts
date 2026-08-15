import { DateTime } from 'luxon';

export type ContratoVigenteSummary = {
  contratoId: number;
  filialId: number;
  filialNome: string;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  dataAlteracao: DateTime;
};

export type FornecedorSummary = {
  id: number;
  nome: string;
  cnpjCpf: string;
  dataAtivacao: DateTime;
  ativo: boolean;
  quantidadeVeiculosAtivos: number;
  contratosVigentes: ContratoVigenteSummary[];
};
