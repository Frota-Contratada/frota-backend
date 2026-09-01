import { DateTime } from 'luxon';
import { Motivo } from '../../../domain/motivo';
import { TipoMotivo } from '../../../enums/tipo-motivo.enum';

export class MotivoDto {
  id: number;
  nome: string;
  tipo: TipoMotivo;
  /** Ausente quando o motivo é global. */
  filialId?: number;
  global: boolean;
  dataAtivacao: DateTime;
  dataDesativacao?: DateTime;

  constructor(motivo: Motivo) {
    this.id = motivo.id;
    this.nome = motivo.nome;
    this.tipo = motivo.tipo;
    this.filialId = motivo.filialId;
    this.global = motivo.global;
    this.dataAtivacao = motivo.dataAtivacao;
    this.dataDesativacao = motivo.dataDesativacao;
  }
}
