import { DateTime } from 'luxon';
import { StatusContrato } from '../../enums/status-contrato.enum';

export type ContratoVinculoSummary = {
  filialId: number;
  filialNome: string;
  fornecedorId: number;
  fornecedorNome: string;
};

export type ContratoSummary = {
  id: number;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  status: StatusContrato;
  vinculos: ContratoVinculoSummary[];
};
