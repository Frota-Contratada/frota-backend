import { DateTime } from 'luxon';

export class Contrato {
  constructor(
    public id: number,
    public caminhoArquivo: string,
    public usuarioCadastroId: number,
    public dataVigenciaInicio: DateTime,
    public dataVigenciaFim?: DateTime,
    public dataAlteracao?: DateTime,
  ) {}
}
