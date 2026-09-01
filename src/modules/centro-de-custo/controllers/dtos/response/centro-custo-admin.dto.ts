import { DateTime } from 'luxon';
import { CentroCusto } from '../../../domain/centro-custo';

export class CentroCustoAdminDto {
  id: number;
  filialId: number;
  nome: string;
  dataAtivacao: DateTime;
  dataDesativacao?: DateTime;

  constructor(centroCusto: CentroCusto) {
    this.id = centroCusto.id;
    this.filialId = centroCusto.filialId;
    this.nome = centroCusto.nome;
    this.dataAtivacao = centroCusto.dataAtivacao;
    this.dataDesativacao = centroCusto.dataDesativacao;
  }
}
