import { Endereco } from '../../filial/domain/endereco';
import { DiaSemana } from '../enums/dia-semana.enum';
import { Periodo } from '../enums/periodo.enum';

export class CondicaoRotaFixa {
  constructor(
    public origem: Endereco,
    public destino: Endereco,
    public id: number = 0,
  ) {}
}

/**
 * Pergunta obrigatória da condição. A regra é aplicável somente quando a
 * resposta da solicitação para essa pergunta for SIM.
 */
export class CondicaoOutro {
  constructor(public pergunta: string, public id: number = 0) {}
}

/**
 * Uma regra possui exatamente uma condição completa. Os critérios preenchidos
 * são combinados com AND; os itens de cada lista são alternativas (OR).
 */
export class CondicaoRegra {
  constructor(
    public id: number,
    public diasSemana: DiaSemana[],
    public periodos: Periodo[],
    public rotasFixas: CondicaoRotaFixa[],
    public tipoVeiculoIds: number[],
    public tipoCorridaIds: number[],
    public outro: CondicaoOutro,
  ) {}
}
