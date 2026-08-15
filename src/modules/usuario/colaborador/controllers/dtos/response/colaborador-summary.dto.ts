import { ColaboradorSummary } from '../../../domain/types/colaborador-summary.type';

export class ColaboradorSummaryDto {
  id: number;
  nome: string;
  email: string;
  cargo?: string;
  fotoPerfil?: string;

  constructor(colaborador: ColaboradorSummary) {
    this.id = colaborador.id;
    this.nome = colaborador.nome;
    this.email = colaborador.email;
    this.cargo = colaborador.cargo;
    this.fotoPerfil = colaborador.fotoPerfil;
  }
}
