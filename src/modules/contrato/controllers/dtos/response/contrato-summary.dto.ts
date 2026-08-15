import { DateTime } from 'luxon';
import {
  ContratoSummary,
  ContratoVinculoSummary,
} from '../../../domain/types/contrato-summary.type';
import { StatusContrato } from '../../../enums/status-contrato.enum';

export class ContratoVinculoDto {
  filialId: number;
  filialNome: string;
  fornecedorId: number;
  fornecedorNome: string;

  constructor(vinculo: ContratoVinculoSummary) {
    this.filialId = vinculo.filialId;
    this.filialNome = vinculo.filialNome;
    this.fornecedorId = vinculo.fornecedorId;
    this.fornecedorNome = vinculo.fornecedorNome;
  }
}

export class ContratoSummaryDto {
  id: number;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  status: StatusContrato;
  vinculos: ContratoVinculoDto[];

  constructor(contrato: ContratoSummary) {
    this.id = contrato.id;
    this.dataVigenciaInicio = contrato.dataVigenciaInicio;
    this.dataVigenciaFim = contrato.dataVigenciaFim;
    this.status = contrato.status;
    this.vinculos = contrato.vinculos.map(
      (vinculo) => new ContratoVinculoDto(vinculo),
    );
  }
}
