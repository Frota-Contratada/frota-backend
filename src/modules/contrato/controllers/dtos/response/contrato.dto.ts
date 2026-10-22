import { DateTime } from 'luxon';
import { Contrato } from '../../../domain/contrato';
import { SituacaoContrato } from '../../../enums/situacao-contrato.enum';

export class ContratoDto {
  id: number;
  caminhoArquivo: string;
  usuarioCadastroId: number;
  dataVigenciaInicio: DateTime;
  dataVigenciaFim?: DateTime;
  dataAlteracao?: DateTime;
  situacao: SituacaoContrato;

  constructor(contrato: Contrato) {
    this.id = contrato.id;
    this.caminhoArquivo = contrato.caminhoArquivo;
    this.usuarioCadastroId = contrato.usuarioCadastroId;
    this.dataVigenciaInicio = contrato.dataVigenciaInicio;
    this.dataVigenciaFim = contrato.dataVigenciaFim;
    this.dataAlteracao = contrato.dataAlteracao;
    this.situacao = contrato.situacao;
  }
}
