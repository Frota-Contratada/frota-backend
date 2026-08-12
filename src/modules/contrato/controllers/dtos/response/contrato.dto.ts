import { DateTime } from 'luxon';
import { Contrato } from '../../../domain/contrato';

export class ContratoDto {
  id: number;
  caminhoArquivo: string;
  usuarioCadastroId: number;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  dataAlteracao?: DateTime;

  constructor(contrato: Contrato) {
    this.id = contrato.id;
    this.caminhoArquivo = contrato.caminhoArquivo;
    this.usuarioCadastroId = contrato.usuarioCadastroId;
    this.dataVigenciaInicio = contrato.dataVigenciaInicio;
    this.dataVigenciaFim = contrato.dataVigenciaFim;
    this.dataAlteracao = contrato.dataAlteracao;
  }
}
