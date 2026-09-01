import { DiaSemana } from '../enums/dia-semana.enum';
import { Periodo } from '../enums/periodo.enum';
import { TipoCondicao } from '../enums/tipo-condicao.enum';

/**
 * Cada condição corresponde a uma linha de CondicaoRegra.
 * O campo `tipo` discrimina a união, então o motor de precificação consegue
 * fazer switch exaustivo sobre ela.
 * O `id` é o nCdCondicao, sequencial dentro da regra.
 */
type CondicaoIdentidade = {
  id: number;
};

export type CondicaoDiasSemana = {
  tipo: TipoCondicao.DIAS_SEMANA;
  diasSemana: DiaSemana[];
};

export type CondicaoPeriodo = {
  tipo: TipoCondicao.PERIODO;
  periodos: Periodo[];
};

export type CondicaoRotaFixa = {
  tipo: TipoCondicao.ROTA_FIXA;
  rotaFixaIds: number[];
};

export type CondicaoTipoVeiculo = {
  tipo: TipoCondicao.TIPO_VEICULO;
  tipoVeiculoIds: number[];
};

export type CondicaoTipoCorrida = {
  tipo: TipoCondicao.TIPO_CORRIDA;
  tipoCorridaIds: number[];
};

/**
 * Pergunta de sim/não respondida pelo solicitante. A condição é satisfeita
 * quando a resposta é "sim".
 */
export type CondicaoOutro = {
  tipo: TipoCondicao.OUTRO;
  perguntaId: number;
};

export type CondicaoValor =
  | CondicaoDiasSemana
  | CondicaoPeriodo
  | CondicaoRotaFixa
  | CondicaoTipoVeiculo
  | CondicaoTipoCorrida
  | CondicaoOutro;

export type CondicaoRegra = CondicaoIdentidade & CondicaoValor;
