import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';

/**
 * Ordenação pedida pela listagem. Sem `ordenarPor`, o repositório mantém a
 * ordem padrão da listagem.
 */
export type Ordenacao<TCampo extends string> = {
  ordenarPor?: TCampo;
  direcao?: DirecaoOrdenacao;
};
