import { DateTime } from 'luxon';
import { SituacaoContrato } from '../enums/situacao-contrato.enum';

export class Contrato {
  constructor(
    public id: number,
    public caminhoArquivo: string,
    public usuarioCadastroId: number,
    public dataVigenciaInicio: DateTime,
    public dataVigenciaFim?: DateTime,
    public dataAlteracao?: DateTime,
    public situacao: SituacaoContrato = SituacaoContrato.RASCUNHO,
  ) {}
}
